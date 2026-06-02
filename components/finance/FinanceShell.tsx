"use client";

import { usePathname } from "next/navigation";

import { ExpenseForm } from "@/components/finance/ExpenseForm";
import { FloatingAddExpenseButton } from "@/components/finance/FloatingAddExpenseButton";
import { RegisterServiceWorker } from "@/components/finance/register-sw";
import { useCategories } from "@/hooks/finance/use-categories";
import { useExpenses } from "@/hooks/finance/use-expenses";
import { normalizeAppPathname } from "@/lib/navigation";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export function FinanceShell({ children }: { children: React.ReactNode }) {
  const pathname = normalizeAppPathname(usePathname());
  const isPersonalExpensesPage = pathname.startsWith("/finance/personal-expenses");
  const expenseFormOpen = useFinanceUiStore((s) => s.expenseFormOpen);
  const setExpenseFormOpen = useFinanceUiStore((s) => s.setExpenseFormOpen);
  const editingExpense = useFinanceUiStore((s) => s.editingExpense);
  const setEditingExpense = useFinanceUiStore((s) => s.setEditingExpense);
  const { year, month } = useFinanceUiStore();
  const { categories } = useCategories();
  const { addExpense, editExpense } = useExpenses({ year, month });

  return (
    <>
      <RegisterServiceWorker />
      <div>{children}</div>
      {!isPersonalExpensesPage && (
        <>
          <FloatingAddExpenseButton />
          <ExpenseForm
            open={expenseFormOpen || Boolean(editingExpense)}
            onOpenChange={(open) => {
              if (!open) {
                setExpenseFormOpen(false);
                setEditingExpense(null);
              }
            }}
            categories={categories}
            expense={editingExpense}
            onSubmit={async (input, id) => {
              if (id) await editExpense(id, input);
              else await addExpense(input as Parameters<typeof addExpense>[0]);
            }}
          />
        </>
      )}
    </>
  );
}
