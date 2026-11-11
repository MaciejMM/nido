"use client";

import { WalletIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { HomeOverviewCard } from "@/components/home/HomeOverviewCard";
import { financeKeys } from "@/hooks/finance/query-keys";
import { fetchHouseholdPlan } from "@/lib/household-plan-api-client";
import { formatCurrency, formatFinanceMonth } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
import type { HouseholdPlanDto } from "@/types";

interface HomeFinancePreviewProps {
  initialYear: number;
  initialMonth: number;
  initialHousehold: HouseholdPlanDto;
}

export function HomeFinancePreview({
  initialYear,
  initialMonth,
  initialHousehold,
}: HomeFinancePreviewProps) {
  const { year, month } = useFinanceUiStore();
  const matchesInitial = year === initialYear && month === initialMonth;

  const { data: plan, isLoading } = useQuery({
    queryKey: financeKeys.household(year, month),
    queryFn: () => fetchHouseholdPlan(year, month),
    initialData: matchesInitial ? initialHousehold : undefined,
    staleTime: 30_000,
  });

  return (
    <HomeOverviewCard
      href="/finance"
      title={pl.home.financeSection}
      subtitle={formatFinanceMonth(year, month)}
      icon={WalletIcon}
    >
      {isLoading && !plan ? (
        <HomeFinanceSkeleton />
      ) : plan ? (
        <HomeFinanceContent plan={plan} />
      ) : null}
    </HomeOverviewCard>
  );
}

function HomeFinanceSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      <div className="h-7 w-32 rounded bg-muted animate-pulse" />
      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
    </div>
  );
}

function HomeFinanceContent({ plan }: { plan: HouseholdPlanDto }) {
  const { summary } = plan;
  const hasPlan =
    summary.incomeCount + summary.expenseCount > 0 || summary.personalExpenses > 0;
  const savingsClass =
    summary.savings < 0
      ? "text-destructive"
      : summary.savings > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "";

  if (!hasPlan) {
    return (
      <p className="text-sm text-muted-foreground">{pl.finance.household.noPlan}</p>
    );
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs text-muted-foreground">
          {pl.finance.household.savings}
        </p>
        <p className={`text-2xl font-semibold tabular-nums ${savingsClass}`}>
          {formatCurrency(summary.savings, summary.currency)}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        {pl.finance.household.income}:{" "}
        {formatCurrency(summary.totalIncome, summary.currency)}
        {" · "}
        {pl.finance.household.costs}:{" "}
        {formatCurrency(summary.totalCosts, summary.currency)}
      </p>
    </div>
  );
}
