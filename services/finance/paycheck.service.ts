import { isPaycheckDeposit } from "@/lib/finance/bank-import/carryover";
import type { ParsedBankTransaction } from "@/lib/finance/bank-import/mbank-parser";
import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { PaycheckAnchor } from "@/models/PaycheckAnchor";
import { Expense } from "@/models/Expense";
import type { PaycheckAnchorDto } from "@/types";
import {
  getCalendarDayUtcRange,
  getCalendarPartsInTimezone,
  getDaysSinceDate,
  getMonthDateRange,
  isCurrentMonth,
} from "@/utils/finance-dates";
import { buildExpenseMonthMatch } from "@/utils/finance-month-match";

export interface SpentSincePaycheckSummary {
  anchor: PaycheckAnchorDto;
  spent: number;
  periodEnd: string;
}

export async function upsertPaychecksFromTransactions(
  transactions: ParsedBankTransaction[],
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<number> {
  let upserted = 0;

  for (const transaction of transactions) {
    if (!isPaycheckDeposit(transaction)) continue;

    const result = await PaycheckAnchor.findOneAndUpdate(
      {
        householdId,
        operationDate: transaction.operationDate,
        amount: transaction.amount,
      },
      {
        householdId,
        operationDate: transaction.operationDate,
        amount: transaction.amount,
        title: transaction.cleanTitle || transaction.title,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();

    if (result) upserted += 1;
  }

  return upserted;
}

export async function findLatestPaycheckBefore(
  periodEnd: Date,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<PaycheckAnchorDto | null> {
  const anchor = await PaycheckAnchor.findOne({
    householdId,
    operationDate: { $lte: periodEnd },
  })
    .sort({ operationDate: -1, createdAt: -1 })
    .exec();

  if (!anchor) return null;

  return {
    operationDate: anchor.operationDate.toISOString(),
    amount: anchor.amount,
    title: anchor.title,
  };
}

export function getDashboardPeriodEnd(
  year: number,
  month: number,
  today: Date = new Date(),
): Date {
  const { end: monthEnd } = getMonthDateRange(year, month);

  if (!isCurrentMonth(year, month, today)) {
    return monthEnd;
  }

  const { year: y, month: m, day } = getCalendarPartsInTimezone(today);
  return getCalendarDayUtcRange(y, m, day).end;
}

export async function sumExpensesBetweenDates(
  from: Date,
  to: Date,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<number> {
  const result = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        householdId,
        date: { $gte: from, $lte: to },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).exec();

  return result[0]?.total ?? 0;
}

/** Expenses from the latest paycheck through period end, or calendar month match. */
export async function resolveExpenseMatchForMonth(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
  today: Date = new Date(),
): Promise<Record<string, unknown>> {
  const periodEnd = getDashboardPeriodEnd(year, month, today);
  const anchor = await findLatestPaycheckBefore(periodEnd, householdId);
  if (!anchor) {
    return buildExpenseMonthMatch(year, month);
  }

  return {
    date: {
      $gte: new Date(anchor.operationDate),
      $lte: periodEnd,
    },
  };
}

export async function sumExpensesForMonthView(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
  today: Date = new Date(),
): Promise<number> {
  const periodEnd = getDashboardPeriodEnd(year, month, today);
  const anchor = await findLatestPaycheckBefore(periodEnd, householdId);
  if (anchor) {
    return sumExpensesBetweenDates(
      new Date(anchor.operationDate),
      periodEnd,
      householdId,
    );
  }

  const result = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        householdId,
        ...buildExpenseMonthMatch(year, month),
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).exec();

  return result[0]?.total ?? 0;
}

export async function getSpentSincePaycheck(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
  today: Date = new Date(),
): Promise<SpentSincePaycheckSummary | null> {
  const periodEnd = getDashboardPeriodEnd(year, month, today);
  const anchor = await findLatestPaycheckBefore(periodEnd, householdId);
  if (!anchor) return null;

  const anchorDate = new Date(anchor.operationDate);
  const spent = await sumExpensesBetweenDates(anchorDate, periodEnd, householdId);

  return {
    anchor,
    spent,
    periodEnd: periodEnd.toISOString(),
  };
}

export function computePaycheckCycleMetrics(
  sincePaycheck: SpentSincePaycheckSummary,
  limitAmount: number,
  daysLeft: number,
  today: Date = new Date(),
): {
  spent: number;
  remaining: number;
  utilizationPercent: number;
  daysElapsed: number;
  dailyAllowance: number;
  avgDailySpend: number;
  projectedOverspend: boolean;
} {
  const spent = sincePaycheck.spent;
  const remaining = limitAmount - spent;
  const daysElapsed = getDaysSinceDate(
    new Date(sincePaycheck.anchor.operationDate),
    today,
  );
  const dailyAllowance = daysLeft > 0 ? remaining / daysLeft : 0;
  const avgDailySpend = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projectedOverspend =
    limitAmount > 0 && spent + avgDailySpend * daysLeft > limitAmount;
  const utilizationPercent =
    limitAmount > 0 ? Math.min(100, (spent / limitAmount) * 100) : 0;

  return {
    spent,
    remaining,
    utilizationPercent,
    daysElapsed,
    dailyAllowance,
    avgDailySpend,
    projectedOverspend,
  };
}
