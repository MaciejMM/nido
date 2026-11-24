import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ExpenseDto } from "@/types";

interface FinanceUiState {
  year: number;
  month: number;
  expenseFormOpen: boolean;
  editingExpense: ExpenseDto | null;
  categoryFilterId: string | null;
  setPeriod: (year: number, month: number) => void;
  setExpenseFormOpen: (open: boolean) => void;
  setEditingExpense: (expense: ExpenseDto | null) => void;
  setCategoryFilterId: (id: string | null) => void;
}

const now = new Date();

const STORAGE_KEY = "nido-finance-period";

function isStoredPeriod(
  value: unknown,
): value is { year: number; month: number } {
  if (!value || typeof value !== "object") return false;
  const period = value as { year?: unknown; month?: unknown };
  return (
    typeof period.year === "number" &&
    Number.isInteger(period.year) &&
    period.year >= 1970 &&
    period.year <= 2200 &&
    typeof period.month === "number" &&
    Number.isInteger(period.month) &&
    period.month >= 1 &&
    period.month <= 12
  );
}

export function isCurrentFinancePeriod(year: number, month: number) {
  const today = new Date();
  return year === today.getFullYear() && month === today.getMonth() + 1;
}

export const useFinanceUiStore = create<FinanceUiState>()(
  persist(
    (set) => ({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      expenseFormOpen: false,
      editingExpense: null,
      categoryFilterId: null,
      setPeriod: (year, month) => set({ year, month }),
      setExpenseFormOpen: (expenseFormOpen) => set({ expenseFormOpen }),
      setEditingExpense: (editingExpense) => set({ editingExpense }),
      setCategoryFilterId: (categoryFilterId) => set({ categoryFilterId }),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({ year: state.year, month: state.month }),
      merge: (persisted, current) => {
        if (!isStoredPeriod(persisted)) return current;
        return { ...current, year: persisted.year, month: persisted.month };
      },
    },
  ),
);
