"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAccountBalance,
  updateAccountBalance,
} from "@/lib/finance-api-client";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
import type { UpdateAccountBalanceInput } from "@/types";

import { invalidateFinanceMonth } from "./invalidate-finance-queries";
import { financeKeys } from "./query-keys";

export function useAccountBalance() {
  const queryClient = useQueryClient();
  const { year, month } = useFinanceUiStore();

  const query = useQuery({
    queryKey: financeKeys.accountBalance,
    queryFn: fetchAccountBalance,
  });

  const saveMutation = useMutation({
    mutationFn: (input: UpdateAccountBalanceInput) => updateAccountBalance(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: financeKeys.accountBalance,
      });
      void invalidateFinanceMonth(queryClient, year, month);
    },
  });

  return {
    accountBalance: query.data,
    loading: query.isLoading,
    saveAccountBalance: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
