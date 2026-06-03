"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bulkDeleteExpenses,
  bulkUpdateExpenseCategory,
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from "@/lib/finance-api-client";
import type {
  BulkDeleteExpensesInput,
  BulkUpdateExpenseCategoryInput,
  CreateExpenseInput,
  ListExpensesFilters,
  UpdateExpenseInput,
} from "@/types";

import {
  invalidateFinanceData,
  monthFromDate,
} from "./invalidate-finance-queries";
import { financeKeys } from "./query-keys";

function monthsToInvalidate(
  filters: ListExpensesFilters,
  ...dates: Array<Date | undefined>
): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = [];
  if (filters.year != null && filters.month != null) {
    months.push({ year: filters.year, month: filters.month });
  }
  for (const date of dates) {
    if (date) months.push(monthFromDate(date));
  }
  return months;
}

export function useExpenses(filters: ListExpensesFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: financeKeys.expenses(filters),
    queryFn: () => fetchExpenses(filters),
  });

  const invalidate = (...dates: Array<Date | undefined>) => {
    void invalidateFinanceData(
      queryClient,
      monthsToInvalidate(filters, ...dates),
    );
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: (_data, input) => invalidate(input.date),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      updateExpense(id, input),
    onSuccess: (_data, { input }) => invalidate(input.date),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => invalidate(),
  });

  const bulkUpdateCategoryMutation = useMutation({
    mutationFn: (input: BulkUpdateExpenseCategoryInput) =>
      bulkUpdateExpenseCategory(input),
    onSuccess: () => invalidate(),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (input: BulkDeleteExpensesInput) => bulkDeleteExpenses(input),
    onSuccess: () => invalidate(),
  });

  return {
    expenses: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
    addExpense: createMutation.mutateAsync,
    editExpense: (id: string, input: UpdateExpenseInput) =>
      updateMutation.mutateAsync({ id, input }),
    removeExpense: deleteMutation.mutateAsync,
    bulkUpdateCategory: bulkUpdateCategoryMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isBulkUpdating: bulkUpdateCategoryMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
  };
}
