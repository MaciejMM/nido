"use client";

import { formatCurrency, formatPercent } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HouseholdPlanSummary } from "@/types";

interface HouseholdSummaryCardsProps {
  summary: HouseholdPlanSummary | undefined;
  loading: boolean;
}

export function HouseholdSummaryCards({
  summary,
  loading,
}: HouseholdSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="col-span-full h-28 rounded-xl" />
      </div>
    );
  }

  if (!summary) return null;

  const hasIncome = summary.totalIncome > 0;
  const savingsRate =
    hasIncome ? (summary.savings / summary.totalIncome) * 100 : null;
  const savingsClass =
    summary.savings < 0
      ? "text-destructive"
      : summary.savings > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.household.income}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.totalIncome, summary.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pl.finance.household.incomeHint}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.household.costs}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.totalCosts, summary.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pl.finance.household.householdCosts}:{" "}
              {formatCurrency(summary.householdExpenses, summary.currency)}
              {" · "}
              {pl.finance.household.personalCosts}:{" "}
              {formatCurrency(summary.personalExpenses, summary.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {pl.finance.household.savings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-semibold tabular-nums ${savingsClass}`}>
            {formatCurrency(summary.savings, summary.currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.savings < 0
              ? pl.finance.household.deficit
              : savingsRate !== null
                ? pl.finance.household.savingsRate(formatPercent(savingsRate))
                : pl.finance.household.savingsHint}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
