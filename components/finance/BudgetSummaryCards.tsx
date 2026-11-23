"use client";

import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Money } from "@/components/finance/Money";
import { formatPercent } from "@/lib/finance/format";
import { dateLocale } from "@/lib/locale";
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
  const hasPaycheckCycle = dashboard.paycheckAnchor !== undefined;
  const hasAccountBalance = dashboard.accountBalance !== undefined;

  const spentLabel = hasPaycheckCycle
    ? pl.finance.dashboard.spentSincePaycheck
    : pl.finance.dashboard.spent;

  const paycheckDateLabel = dashboard.paycheckAnchor
    ? format(new Date(dashboard.paycheckAnchor.operationDate), "d MMM yyyy", {
        locale: dateLocale,
      })
    : null;

  const balanceAsOfLabel = dashboard.accountBalanceAsOf
    ? format(new Date(dashboard.accountBalanceAsOf), "d MMM yyyy, HH:mm", {
        locale: dateLocale,
      })
    : null;

  return (
    <div className="space-y-3">
      {hasAccountBalance && (
        <Card className="rounded-xl border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {pl.finance.dashboard.accountBalance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              <Money
                amount={dashboard.accountBalance!}
                currency={dashboard.currency}
              />
            </p>
            {balanceAsOfLabel && (
              <p className="mt-1 text-xs text-muted-foreground">
                {pl.finance.dashboard.accountBalanceAsOf(balanceAsOfLabel)}
                {dashboard.accountBalanceSource === "import"
                  ? ` · ${pl.finance.dashboard.accountBalanceFromImport}`
                  : null}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {spentLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              <Money amount={dashboard.spent} currency={dashboard.currency} />
            </p>
            {hasPaycheckCycle && paycheckDateLabel && dashboard.paycheckAnchor ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {pl.finance.dashboard.paycheckSinceLead}{" "}
                <Money
                  amount={dashboard.paycheckAnchor.amount}
                  currency={dashboard.currency}
                />{" "}
                ({paycheckDateLabel})
              </p>
            ) : hasLimit ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {pl.finance.dashboard.limit}:{" "}
                <Money amount={dashboard.limitAmount} currency={dashboard.currency} />
              </p>
            ) : null}
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
              <Money amount={dashboard.remaining} currency={dashboard.currency} />
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
                  <Money
                    amount={dashboard.dailyAllowance}
                    currency={dashboard.currency}
                  />
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
