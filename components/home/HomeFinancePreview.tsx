"use client";

import { WalletIcon } from "lucide-react";

import { BudgetProgressRing } from "@/components/finance/BudgetProgressRing";
import { HomeOverviewCard } from "@/components/home/HomeOverviewCard";
import { useFinanceDashboard } from "@/hooks/finance/use-finance-dashboard";
import {
  formatCurrency,
  formatFinanceMonth,
  formatPercent,
} from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { BudgetDashboardDto } from "@/types";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export function HomeFinancePreview() {
  const { year, month } = useFinanceUiStore();
  const { data: dashboard, isLoading } = useFinanceDashboard(year, month);

  return (
    <HomeOverviewCard
      href="/finance"
      title={pl.home.financeSection}
      subtitle={formatFinanceMonth(year, month)}
      icon={WalletIcon}
    >
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ) : dashboard ? (
        <HomeFinanceContent dashboard={dashboard} />
      ) : null}
    </HomeOverviewCard>
  );
}

function HomeFinanceContent({ dashboard }: { dashboard: BudgetDashboardDto }) {
  const hasLimit = dashboard.limitAmount > 0;

  if (!hasLimit) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          {pl.finance.dashboard.spent}
        </p>
        <p className="text-2xl font-semibold tabular-nums">
          {formatCurrency(dashboard.spent, dashboard.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {pl.finance.dashboard.noBudget}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex shrink-0 items-center justify-center">
        <BudgetProgressRing percent={dashboard.utilizationPercent} size={56} />
        <span className="absolute text-[10px] font-semibold tabular-nums">
          {formatPercent(dashboard.utilizationPercent)}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {pl.finance.dashboard.spent}
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(dashboard.spent, dashboard.currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {pl.finance.dashboard.remaining}
          </p>
          <p
            className={`text-lg font-semibold tabular-nums ${
              dashboard.remaining < 0 ? "text-destructive" : ""
            }`}
          >
            {formatCurrency(dashboard.remaining, dashboard.currency)}
          </p>
        </div>
        {dashboard.daysLeft > 0 && (
          <p className="text-xs text-muted-foreground">
            {pl.finance.dashboard.daysLeft(dashboard.daysLeft)}
          </p>
        )}
      </div>
    </div>
  );
}
