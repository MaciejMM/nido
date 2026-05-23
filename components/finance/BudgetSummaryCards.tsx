"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BudgetDashboardDto } from "@/types";

import { BudgetProgressRing } from "./BudgetProgressRing";

interface BudgetSummaryCardsProps {
  dashboard: BudgetDashboardDto | undefined;
  loading: boolean;
  insights?: React.ReactNode;
}

export function BudgetSummaryCards({
  dashboard,
  loading,
  insights,
}: BudgetSummaryCardsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="col-span-full h-24 rounded-xl" />
        </div>
        {insights}
      </div>
    );
  }

  if (!dashboard) return null;

  const hasLimit = dashboard.limitAmount > 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.dashboard.spent}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(dashboard.spent, dashboard.currency)}
            </p>
            {hasLimit && (
              <p className="mt-1 text-xs text-muted-foreground">
                {pl.finance.dashboard.limit}:{" "}
                {formatCurrency(dashboard.limitAmount, dashboard.currency)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.dashboard.remaining}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-semibold tabular-nums ${
                dashboard.remaining < 0 ? "text-destructive" : ""
              }`}
            >
              {formatCurrency(dashboard.remaining, dashboard.currency)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pl.finance.dashboard.daysLeft(dashboard.daysLeft)}
            </p>
          </CardContent>
        </Card>
      </div>

      {hasLimit && (
        <Card className="rounded-xl">
          <CardContent className="flex items-center gap-4 pt-4">
            <BudgetProgressRing percent={dashboard.utilizationPercent} />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium">
                {pl.finance.dashboard.utilization}{" "}
                {formatPercent(dashboard.utilizationPercent)}
              </p>
              {dashboard.daysLeft > 0 && (
                <p className="text-xs text-muted-foreground">
                  {pl.finance.dashboard.dailyAllowance}:{" "}
                  {formatCurrency(dashboard.dailyAllowance, dashboard.currency)}
                </p>
              )}
              {dashboard.projectedOverspend && (
                <p className="text-xs text-destructive">
                  {pl.finance.dashboard.projectedOverspend}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!hasLimit && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {pl.finance.dashboard.noBudget}
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/finance/settings" />}
          >
            {pl.finance.nav.settings}
          </Button>
        </div>
      )}

      {insights}
    </div>
  );
}
