"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { CopyFromPreviousMonthButton } from "@/components/finance/personal-expenses/CopyFromPreviousMonthButton";
import { PersonalExpenseForm } from "@/components/finance/personal-expenses/PersonalExpenseForm";
import { PersonalExpenseList } from "@/components/finance/personal-expenses/PersonalExpenseList";
import { PersonalExpenseSummaryCards } from "@/components/finance/personal-expenses/PersonalExpenseSummaryCards";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { Button } from "@/components/ui/button";
import { usePersonalExpenses } from "@/hooks/finance/use-personal-expenses";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
import type {
  CreatePersonalExpenseInput,
  PersonalExpenseDto,
  UpdatePersonalExpenseInput,
} from "@/types";

export default function PersonalExpensesPage() {
  const { year, month } = useFinanceUiStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PersonalExpenseDto | null>(
    null,
  );
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    items,
    summary,
    loading,
    addExpense,
    editExpense,
    removeExpense,
    togglePaid,
    copyFromPrevious,
    isCopying,
    isToggling,
  } = usePersonalExpenses(year, month);

  const handleEdit = (expense: PersonalExpenseDto) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleSubmit = async (
    input: CreatePersonalExpenseInput | UpdatePersonalExpenseInput,
    id?: string,
  ) => {
    if (id) {
      await editExpense(id, input);
    } else {
      await addExpense(input as CreatePersonalExpenseInput);
    }
    setEditingExpense(null);
  };

  const handleTogglePaid = async (id: string, isPaid: boolean) => {
    setTogglingId(id);
    try {
      await togglePaid(id, isPaid);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.personalExpenses.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.personalExpenses.subtitle}
        </p>
      </div>

      <FinanceMonthSwitcher />

      <PersonalExpenseSummaryCards summary={summary} loading={loading} />

      <div className="flex justify-end">
        <CopyFromPreviousMonthButton
          year={year}
          month={month}
          disabled={items.length > 0}
          loading={isCopying}
          onCopy={copyFromPrevious}
        />
      </div>

      <PersonalExpenseList
        items={items}
        loading={loading}
        onEdit={handleEdit}
        onDelete={removeExpense}
        onTogglePaid={handleTogglePaid}
        togglingId={isToggling ? togglingId : null}
      />

      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-50 size-14 rounded-full shadow-lg md:bottom-8"
        onClick={() => {
          setEditingExpense(null);
          setFormOpen(true);
        }}
        aria-label={pl.finance.personalExpenses.add}
      >
        <PlusIcon className="size-6" />
      </Button>

      <PersonalExpenseForm
        open={formOpen || Boolean(editingExpense)}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingExpense(null);
          }
        }}
        year={year}
        month={month}
        expense={editingExpense}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
