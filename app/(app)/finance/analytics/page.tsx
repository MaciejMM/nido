"use client";

import { FinanceCharts } from "@/components/finance/FinanceCharts";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { useFinanceAnalytics } from "@/hooks/finance/use-finance-analytics";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export default function FinanceAnalyticsPage() {
  const { year, month } = useFinanceUiStore();
  const analytics = useFinanceAnalytics(year, month);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.analytics.title}
        </h1>
      </div>
      <FinanceMonthSwitcher />
      <FinanceCharts analytics={analytics.data} loading={analytics.isLoading} />
    </div>
  );
}
