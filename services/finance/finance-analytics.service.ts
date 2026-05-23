import { format } from "date-fns";

import { DEFAULT_CURRENCY, DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { dateLocale } from "@/lib/locale";
import { Expense } from "@/models/Expense";
import type {
  BudgetDashboardDto,
  CategorySpendItem,
  DailySpendItem,
  FinanceAnalyticsDto,
  MonthlySpendItem,
} from "@/types";
import {
  getDaysElapsedInMonth,
  getDaysInCalendarMonth,
  getDaysLeftInMonth,
  getMonthDateRange,
  monthKey,
} from "@/utils/finance-dates";

import * as budgetService from "./budget.service";
import * as categoryService from "./category.service";
import * as expenseService from "./expense.service";

export async function getBudgetDashboard(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
  today: Date = new Date(),
): Promise<BudgetDashboardDto> {
  const spent = await expenseService.sumExpensesInMonth(year, month, householdId);
  const budget = await budgetService.getBudget(year, month, householdId);
  const limitAmount = budget?.limitAmount ?? 0;
  const remaining = limitAmount - spent;
  const daysInMonth = getDaysInCalendarMonth(year, month);
  const daysElapsed = getDaysElapsedInMonth(year, month, today);
  const daysLeft = getDaysLeftInMonth(year, month, today);
  const dailyAllowance = daysLeft > 0 ? remaining / daysLeft : 0;
  const avgDailySpend = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projectedOverspend =
    limitAmount > 0 && avgDailySpend * daysInMonth > limitAmount;
  const utilizationPercent =
    limitAmount > 0 ? Math.min(100, (spent / limitAmount) * 100) : 0;

  return {
    year,
    month,
    limitAmount,
    spent,
    remaining,
    utilizationPercent,
    daysLeft,
    daysElapsed,
    daysInMonth,
    dailyAllowance,
    avgDailySpend,
    projectedOverspend,
    currency: DEFAULT_CURRENCY,
  };
}

export async function getFinanceAnalytics(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<FinanceAnalyticsDto> {
  const { start, end } = getMonthDateRange(year, month);
  const [totalSpent, budget] = await Promise.all([
    expenseService.sumExpensesInMonth(year, month, householdId),
    budgetService.getBudget(year, month, householdId),
  ]);
  const limitAmount = budget?.limitAmount ?? 0;

  const [categoryAgg, householdCategories] = await Promise.all([
    Expense.aggregate<{
      _id: { toString(): string };
      name: string;
      color: string;
      monthlyLimit: number | null;
      total: number;
    }>([
    {
      $match: {
        householdId,
        date: { $gte: start, $lte: end },
      },
    },
    {
      $lookup: {
        from: "expensecategories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$categoryId",
        name: { $first: "$category.name" },
        color: { $first: "$category.color" },
        monthlyLimit: { $first: "$category.monthlyLimit" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]).exec(),
    categoryService.listCategories(householdId),
  ]);

  const spentByCategoryId = new Map(
    categoryAgg.map((row) => [row._id.toString(), row] as const),
  );

  const categoryBreakdown: CategorySpendItem[] = householdCategories
    .filter((cat) => {
      const spent = spentByCategoryId.get(cat.id)?.total ?? 0;
      const limit = cat.monthlyLimit ?? null;
      return spent > 0 || (limit != null && limit > 0);
    })
    .map((cat) => {
      const agg = spentByCategoryId.get(cat.id);
      const amount = agg?.total ?? 0;
      const limitAmount = cat.monthlyLimit ?? null;
      const utilizationPercent =
        limitAmount != null && limitAmount > 0
          ? Math.min(100, (amount / limitAmount) * 100)
          : null;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        amount,
        percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        limitAmount,
        utilizationPercent,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const trendMonths: { year: number; month: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, month - 1 - i, 1);
    trendMonths.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const monthlyTrend: MonthlySpendItem[] = await Promise.all(
    trendMonths.map(async ({ year: y, month: m }) => {
      const spent = await expenseService.sumExpensesInMonth(y, m, householdId);
      const budget = await budgetService.getBudget(y, m, householdId);
      const key = monthKey(y, m);
      const label = format(new Date(y, m - 1, 1), "LLL yy", {
        locale: dateLocale,
      });
      return {
        monthKey: key,
        label,
        spent,
        limit: budget?.limitAmount ?? 0,
      };
    }),
  );

  const dailyAgg = await Expense.aggregate<{ _id: number; total: number }>([
    {
      $match: {
        householdId,
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$date" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]).exec();

  const dailySpending: DailySpendItem[] = dailyAgg.map((row) => ({
    day: row._id,
    amount: row.total,
  }));

  return {
    year,
    month,
    limitAmount,
    categoryBreakdown,
    monthlyTrend,
    dailySpending,
    totalSpent,
  };
}

export async function getHistoricalMonthlyTotals(
  monthsBack: number,
  endYear: number,
  endMonth: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<{ year: number; month: number; spent: number }[]> {
  const results: { year: number; month: number; spent: number }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(endYear, endMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const spent = await expenseService.sumExpensesInMonth(y, m, householdId);
    results.push({ year: y, month: m, spent });
  }
  return results;
}
