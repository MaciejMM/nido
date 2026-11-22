"use client";

import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";

import { FinanceCharts } from "@/components/finance/FinanceCharts";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { HouseholdSummaryCards } from "@/components/finance/household/HouseholdSummaryCards";
import { financeKeys } from "@/hooks/finance/query-keys";
import { fetchHouseholdPlan } from "@/lib/household-plan-api-client";
import { pl } from "@/lib/i18n";
import { dateLocale } from "@/lib/locale";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

function recentMonths(year: number, month: number, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const date = new Date(year, month - 1 - offset, 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });
}

export default function FinanceAnalyticsPage() {
  const { year, month } = useFinanceUiStore();
  const months = useMemo(() => recentMonths(year, month), [year, month]);
  const queries = useQueries({
    queries: months.map((item) => ({
      queryKey: financeKeys.household(item.year, item.month),
      queryFn: () => fetchHouseholdPlan(item.year, item.month),
      staleTime: 30_000,
    })),
  });

  const loading = queries.some((query) => query.isLoading);
  const current = queries.at(-1)?.data;
  const trend = months.map((item, index) => {
    const summary = queries[index]?.data?.summary;
    return {
      label: format(new Date(item.year, item.month - 1, 1), "LLL yy", {
        locale: dateLocale,
      }),
      income: summary?.totalIncome ?? 0,
      costs: summary?.totalCosts ?? 0,
      savings: summary?.savings ?? 0,
    };
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.analytics.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.analytics.subtitle}
        </p>
      </div>
      <FinanceMonthSwitcher />
      {queries.some((query) => query.isError) ? (
        <p className="text-sm text-destructive">{pl.common.requestFailed}</p>
      ) : null}
      <HouseholdSummaryCards summary={current?.summary} loading={loading && !current} />
      <FinanceCharts plan={current} trend={trend} loading={loading && !current} />
    </div>
  );
}
