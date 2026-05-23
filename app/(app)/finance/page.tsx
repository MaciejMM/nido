"use client";

import { AiInsightCard } from "@/components/finance/AiInsightCard";
import { BudgetSummaryCards } from "@/components/finance/BudgetSummaryCards";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { useFinanceDashboard } from "@/hooks/finance/use-finance-dashboard";
import { useMonthAnalysis } from "@/hooks/finance/use-month-analysis";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export default function FinanceDashboardPage() {
  const { year, month } = useFinanceUiStore();
  const dashboard = useFinanceDashboard(year, month);
  const analysis = useMonthAnalysis(year, month);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.dashboard.subtitle}
        </p>
      </div>

      <FinanceMonthSwitcher />
      <BudgetSummaryCards
        dashboard={dashboard.data}
        loading={dashboard.isLoading}
        insights={
          <AiInsightCard
            analysis={analysis.data}
            loading={analysis.isLoading || analysis.isFetching}
          />
        }
      />
    </div>
  );
}
