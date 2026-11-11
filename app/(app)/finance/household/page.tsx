"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { CopyHouseholdPlanButton } from "@/components/finance/household/CopyHouseholdPlanButton";
import { HouseholdLineForm } from "@/components/finance/household/HouseholdLineForm";
import { HouseholdLineList } from "@/components/finance/household/HouseholdLineList";
import { HouseholdPersonalLines } from "@/components/finance/household/HouseholdPersonalLines";
import { HouseholdSummaryCards } from "@/components/finance/household/HouseholdSummaryCards";
import { PersonalInclusionControl } from "@/components/finance/household/PersonalInclusionControl";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { Button } from "@/components/ui/button";
import { useHouseholdPlan } from "@/hooks/finance/use-household-plan";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
import type {
  CreateHouseholdLineInput,
  HouseholdLineDto,
  HouseholdLineKind,
  UpdateHouseholdLineInput,
} from "@/types";

export default function HouseholdPlanPage() {
  const { year, month } = useFinanceUiStore();
  const [formOpen, setFormOpen] = useState(false);
  const [formKind, setFormKind] = useState<HouseholdLineKind>("income");
  const [editingLine, setEditingLine] = useState<HouseholdLineDto | null>(null);

  const {
    plan,
    loading,
    addLine,
    editLine,
    removeLine,
    setPersonalInclusion,
    copyFromPrevious,
    isCopying,
    isUpdatingInclusion,
  } = useHouseholdPlan(year, month);

  const currency = plan?.summary.currency ?? "PLN";
  const hasLines = (plan?.incomes.length ?? 0) + (plan?.expenses.length ?? 0) > 0;

  const openCreate = (kind: HouseholdLineKind) => {
    setEditingLine(null);
    setFormKind(kind);
    setFormOpen(true);
  };

  const openEdit = (line: HouseholdLineDto) => {
    setEditingLine(line);
    setFormKind(line.kind);
    setFormOpen(true);
  };

  const handleSubmit = async (
    input: CreateHouseholdLineInput | UpdateHouseholdLineInput,
    id?: string,
  ) => {
    if (id) {
      await editLine(id, input);
      return;
    }
    await addLine(input as CreateHouseholdLineInput);
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.household.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.household.subtitle}
        </p>
      </div>

      <FinanceMonthSwitcher />
      <HouseholdSummaryCards summary={plan?.summary} loading={loading} />

      <div className="sm:flex sm:justify-end">
        <CopyHouseholdPlanButton
          year={year}
          month={month}
          disabled={hasLines}
          loading={isCopying}
          onCopy={copyFromPrevious}
        />
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{pl.finance.household.income}</h2>
            <p className="text-sm text-muted-foreground">
              {pl.finance.household.incomeHint}
            </p>
          </div>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => openCreate("income")}
          >
            <PlusIcon />
            {pl.finance.household.addIncome}
          </Button>
        </div>
        <HouseholdLineList
          items={plan?.incomes ?? []}
          currency={currency}
          loading={loading}
          emptyTitle={pl.finance.household.emptyIncome}
          emptyHint={pl.finance.household.emptyIncomeHint}
          onEdit={openEdit}
          onDelete={removeLine}
        />
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {pl.finance.household.expenses}
            </h2>
            <p className="text-sm text-muted-foreground">
              {pl.finance.household.expensesHint}
            </p>
          </div>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => openCreate("expense")}
          >
            <PlusIcon />
            {pl.finance.household.addExpense}
          </Button>
        </div>
        <HouseholdLineList
          items={plan?.expenses ?? []}
          currency={currency}
          loading={loading}
          emptyTitle={pl.finance.household.emptyExpenses}
          emptyHint={pl.finance.household.emptyExpensesHint}
          onEdit={openEdit}
          onDelete={removeLine}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">
            {pl.finance.household.personalSection}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pl.finance.household.personalHint}
          </p>
        </div>
        <PersonalInclusionControl
          value={plan?.personalInclusion ?? "consolidated"}
          disabled={loading || isUpdatingInclusion || !plan}
          onChange={(mode) => {
            void setPersonalInclusion(mode).catch((error: unknown) => {
              toast.error(
                error instanceof Error ? error.message : pl.common.requestFailed,
              );
            });
          }}
        />
        {plan && plan.personalInclusion !== "none" ? (
          <HouseholdPersonalLines
            lines={plan.personalLines}
            personalCount={plan.summary.personalCount}
            currency={currency}
          />
        ) : (
          <Link
            href="/finance/personal-expenses"
            className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            {pl.finance.household.openPersonal}
          </Link>
        )}
      </section>

      <HouseholdLineForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLine(null);
        }}
        year={year}
        month={month}
        kind={formKind}
        line={editingLine}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
