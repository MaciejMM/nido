"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchBudget, upsertBudget } from "@/lib/finance-api-client";
import type { UpsertBudgetInput } from "@/types";

import { invalidateFinanceMonth } from "./invalidate-finance-queries";
import { financeKeys } from "./query-keys";

export function useBudget(year: number, month: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: financeKeys.budget(year, month),
    queryFn: () => fetchBudget(year, month),
  });

  const upsertMutation = useMutation({
    mutationFn: (input: UpsertBudgetInput) => upsertBudget(input),
    onSuccess: () => {
      void invalidateFinanceMonth(queryClient, year, month);
    },
  });

  return {
    budget: query.data,
    loading: query.isLoading,
    saveBudget: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
}
