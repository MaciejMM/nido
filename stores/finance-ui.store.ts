import { create } from "zustand";

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

export const useFinanceUiStore = create<FinanceUiState>((set) => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  expenseFormOpen: false,
  editingExpense: null,
  categoryFilterId: null,
  setPeriod: (year, month) => set({ year, month }),
  setExpenseFormOpen: (expenseFormOpen) => set({ expenseFormOpen }),
  setEditingExpense: (editingExpense) => set({ editingExpense }),
  setCategoryFilterId: (categoryFilterId) => set({ categoryFilterId }),
}));
