"use client";

import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PersonalExpenseSummary } from "@/types";

interface PersonalExpenseSummaryCardsProps {
  summary: PersonalExpenseSummary | undefined;
  loading: boolean;
}

export function PersonalExpenseSummaryCards({
  summary,
  loading,
}: PersonalExpenseSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="col-span-full h-24 rounded-xl" />
      </div>
    );
  }

  if (!summary) return null;

  const totalCount = summary.paidCount + summary.unpaidCount;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.personalExpenses.planned}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.totalAmount, summary.currency)}
            </p>
            {totalCount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {pl.finance.personalExpenses.paidCount(
                  summary.paidCount,
                  totalCount,
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.personalExpenses.paid}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.paidAmount, summary.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {pl.finance.personalExpenses.remaining}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary.remainingAmount, summary.currency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
