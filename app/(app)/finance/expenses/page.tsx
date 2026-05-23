"use client";

import { ExpenseCsvImport } from "@/components/finance/ExpenseCsvImport";
import { ExpenseFilters } from "@/components/finance/ExpenseFilters";
import { ExpenseList } from "@/components/finance/ExpenseList";
import { FinanceMonthSwitcher } from "@/components/finance/FinanceMonthSwitcher";
import { useExpenses } from "@/hooks/finance/use-expenses";
import { useCategories } from "@/hooks/finance/use-categories";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
export default function FinanceExpensesPage() {
  const {
    year,
    month,
    categoryFilterId,
    setCategoryFilterId,
    setExpenseFormOpen,
    setEditingExpense,
  } = useFinanceUiStore();
  const { categories } = useCategories();
  const { expenses, loading, removeExpense, bulkUpdateCategory } = useExpenses({
    year,
    month,
    categoryId: categoryFilterId ?? undefined,
  });

  const handleEdit = (expense: Parameters<typeof setEditingExpense>[0]) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.expenses.title}
        </h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-auto">
          <FinanceMonthSwitcher />
        </div>
        <ExpenseCsvImport year={year} month={month} />
      </div>
      <ExpenseFilters
        categories={categories}
        categoryId={categoryFilterId}
        onCategoryChange={setCategoryFilterId}
      />
      <ExpenseList
        key={`${year}-${month}-${categoryFilterId ?? "all"}`}
        expenses={expenses}
        loading={loading}
        categories={categories}
        onEdit={handleEdit}
        onDelete={removeExpense}
        onBulkUpdateCategory={async (ids, categoryId) => {
          await bulkUpdateCategory({ ids, categoryId });
        }}
      />
    </div>
  );
}
