import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { pl } from "@/lib/i18n";
import type { AiInsight, MonthAnalysisDto } from "@/types";
import { formatCurrency } from "@/lib/finance/format";
import {
  getCalendarDayUtcRange,
  getCalendarPartsInTimezone,
  isCurrentMonth,
} from "@/utils/finance-dates";

import type { AiProvider, MonthAnalysisInput } from "../types";
import * as analyticsService from "@/services/finance/finance-analytics.service";
import * as expenseService from "@/services/finance/expense.service";

export class MockAiProvider implements AiProvider {
  async analyzeMonth(input: MonthAnalysisInput): Promise<MonthAnalysisDto> {
    const householdId = input.householdId ?? DEFAULT_HOUSEHOLD_ID;
    const { year, month } = input;

    const dashboard = await analyticsService.getBudgetDashboard(
      year,
      month,
      householdId,
    );
    const analytics = await analyticsService.getFinanceAnalytics(
      year,
      month,
      householdId,
    );
    const history = await analyticsService.getHistoricalMonthlyTotals(
      6,
      year,
      month,
      householdId,
    );

    const insights: AiInsight[] = [];
    const priorMonths = history.filter(
      (h) => !(h.year === year && h.month === month),
    );
    const avgHistorical =
      priorMonths.length > 0
        ? priorMonths.reduce((s, h) => s + h.spent, 0) / priorMonths.length
        : 0;

    if (avgHistorical > 0 && dashboard.spent > 0) {
      const delta = ((dashboard.spent - avgHistorical) / avgHistorical) * 100;
      const faster = delta > 5;
      insights.push({
        id: "pace",
        title: pl.finance.ai.paceTitle,
        message: faster
          ? pl.finance.ai.paceFaster(`${Math.round(Math.abs(delta))}%`)
          : pl.finance.ai.paceSlower(`${Math.round(Math.abs(delta))}%`),
        severity: faster ? "warning" : "success",
      });
    }

    if (dashboard.limitAmount > 0 && dashboard.remaining <= 0) {
      insights.push({
        id: "budget-exhausted",
        title: pl.finance.ai.budgetTitle,
        message: pl.finance.ai.budgetExhausted,
        severity: "warning",
      });
    } else if (dashboard.limitAmount > 0 && dashboard.daysLeft > 0) {
      const daysLeftAtPace =
        dashboard.avgDailySpend > 0
          ? Math.ceil(dashboard.remaining / dashboard.avgDailySpend)
          : dashboard.daysLeft;

      if (daysLeftAtPace > dashboard.daysLeft) {
        insights.push({
          id: "budget-pace",
          title: pl.finance.ai.budgetTitle,
          message: pl.finance.ai.budgetLastsMonth,
          severity: "success",
        });
      } else {
        insights.push({
          id: "budget-pace",
          title: pl.finance.ai.budgetTitle,
          message: pl.finance.ai.budgetDaysLeft(daysLeftAtPace),
          severity: daysLeftAtPace < dashboard.daysLeft ? "warning" : "info",
        });
      }
    }

    const top = analytics.categoryBreakdown[0];
    if (top) {
      insights.push({
        id: "top-category",
        title: pl.finance.ai.topCategoryTitle,
        message: pl.finance.ai.topCategory(top.categoryName, formatCurrency(top.amount)),
        severity: "info",
      });
    }

    if (
      isCurrentMonth(year, month) &&
      dashboard.dailyAllowance > 0
    ) {
      const { day } = getCalendarPartsInTimezone();
      const { start, end } = getCalendarDayUtcRange(year, month, day);
      const todayExpenses = await expenseService.listExpenses(
        { dateFrom: start, dateTo: end },
        householdId,
      );
      const todaySpent = todayExpenses.reduce((s, e) => s + e.amount, 0);

      if (todaySpent > dashboard.dailyAllowance) {
        insights.push({
          id: "today-spend",
          title: pl.finance.ai.todayTitle,
          message: pl.finance.ai.todayHigh(
            formatCurrency(todaySpent),
            formatCurrency(dashboard.dailyAllowance),
          ),
          severity: "warning",
        });
      } else if (todaySpent > 0) {
        insights.push({
          id: "today-spend",
          title: pl.finance.ai.todayTitle,
          message: pl.finance.ai.todayOk(formatCurrency(todaySpent)),
          severity: "success",
        });
      }
    }

    if (dashboard.projectedOverspend) {
      insights.push({
        id: "projection",
        title: pl.finance.ai.projectionTitle,
        message: pl.finance.ai.projectionOverspend,
        severity: "warning",
      });
    }

    const summary =
      dashboard.limitAmount > 0
        ? pl.finance.ai.summaryWithBudget(
            formatCurrency(dashboard.spent),
            formatCurrency(dashboard.limitAmount),
          )
        : pl.finance.ai.summaryNoBudget(formatCurrency(dashboard.spent));

    return {
      year,
      month,
      summary,
      insights: insights.slice(0, 4),
    };
  }
}
