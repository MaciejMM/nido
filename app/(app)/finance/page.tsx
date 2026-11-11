"use client";

import Link from "next/link";

import { HouseholdSummaryCards } from "@/components/finance/household/HouseholdSummaryCards";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHouseholdPlan } from "@/hooks/finance/use-household-plan";
import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export default function FinanceDashboardPage() {
  const { year, month } = useFinanceUiStore();
  const { plan, loading } = useHouseholdPlan(year, month);
  const currency = plan?.summary.currency ?? "PLN";
  const hasPlan =
    (plan?.summary.incomeCount ?? 0) + (plan?.summary.expenseCount ?? 0) > 0 ||
    (plan?.summary.personalExpenses ?? 0) > 0;

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
      <HouseholdSummaryCards summary={plan?.summary} loading={loading} />

      {plan && hasPlan ? (
        <div className="space-y-4">
          <Breakdown
            title={pl.finance.household.income}
            rows={plan.incomes.map((line) => ({
              id: line.id,
              label: line.title,
              amount: line.amount,
            }))}
            currency={currency}
          />
          <Breakdown
            title={pl.finance.household.expenses}
            rows={plan.expenses.map((line) => ({
              id: line.id,
              label: line.title,
              amount: line.amount,
            }))}
            currency={currency}
          />
          {plan.personalInclusion !== "none" ? (
            <Breakdown
              title={pl.finance.household.personalSection}
              rows={plan.personalLines.map((line) => ({
                id: line.id,
                label:
                  line.source === "consolidated"
                    ? pl.finance.household.consolidatedTitle
                    : line.title,
                amount: line.amount,
              }))}
              currency={currency}
            />
          ) : null}
        </div>
      ) : null}

      {!loading && plan && !hasPlan ? (
        <p className="text-sm text-muted-foreground">{pl.finance.household.noPlan}</p>
      ) : null}

      <Link
        href="/finance/household"
        className={cn(buttonVariants())}
      >
        {pl.finance.household.openPlan}
      </Link>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  currency,
}: {
  title: string;
  rows: { id: string; label: string; amount: number }[];
  currency: string;
}) {
  if (rows.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
          >
            <span className="truncate">{row.label}</span>
            <span className="shrink-0 tabular-nums">
              {formatCurrency(row.amount, currency)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
