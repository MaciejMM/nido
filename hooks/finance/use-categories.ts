"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/finance-api-client";
import type {
  CreateCategoryInput,
  ExpenseCategoryDto,
  UpdateCategoryInput,
} from "@/types";

import { useFinanceUiStore } from "@/stores/finance-ui.store";

import { invalidateFinanceMonth } from "./invalidate-finance-queries";
import { financeKeys } from "./query-keys";

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: financeKeys.categories,
    queryFn: fetchCategories,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: financeKeys.categories });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: financeKeys.categories });
    },
    onSuccess: (updated) => {
      const { year, month } = useFinanceUiStore.getState();
      queryClient.setQueryData<ExpenseCategoryDto[]>(
        financeKeys.categories,
        (old) =>
          old?.map((category) =>
            category.id === updated.id ? updated : category,
          ) ?? [updated],
      );
      void invalidateFinanceMonth(queryClient, year, month);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_data, id) => {
      const { year, month } = useFinanceUiStore.getState();
      queryClient.setQueryData<ExpenseCategoryDto[]>(
        financeKeys.categories,
        (old) => old?.filter((category) => category.id !== id) ?? [],
      );
      void invalidateFinanceMonth(queryClient, year, month);
    },
  });

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addCategory: createMutation.mutateAsync,
    updateCategoryLimit: updateMutation.mutateAsync,
    removeCategory: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
