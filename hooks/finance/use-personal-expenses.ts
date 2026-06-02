"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  copyPersonalExpensesFromPrevious,
  createPersonalExpense,
  deletePersonalExpense,
  fetchPersonalExpenses,
  patchPersonalExpense,
  updatePersonalExpense,
} from "@/lib/personal-expense-api-client";
import type {
  CopyFromPreviousMonthInput,
  CreatePersonalExpenseInput,
  PersonalExpenseListResponse,
  UpdatePersonalExpenseInput,
} from "@/types";

import { financeKeys } from "./query-keys";

function invalidatePersonalExpenses(
  queryClient: ReturnType<typeof useQueryClient>,
  year: number,
  month: number,
) {
  return queryClient.invalidateQueries({
    queryKey: financeKeys.personalExpenses(year, month),
  });
}

export function usePersonalExpenses(year: number, month: number) {
  const queryClient = useQueryClient();
  const queryKey = financeKeys.personalExpenses(year, month);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchPersonalExpenses(year, month),
  });

  const invalidate = () =>
    invalidatePersonalExpenses(queryClient, year, month);

  const createMutation = useMutation({
    mutationFn: (input: CreatePersonalExpenseInput) =>
      createPersonalExpense(input),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePersonalExpenseInput }) =>
      updatePersonalExpense(id, input),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePersonalExpense(id),
    onSuccess: () => invalidate(),
  });

  const copyMutation = useMutation({
    mutationFn: (input: CopyFromPreviousMonthInput) =>
      copyPersonalExpensesFromPrevious(input),
    onSuccess: () => invalidate(),
  });

  const togglePaidMutation = useMutation({
    mutationFn: ({ id, isPaid }: { id: string; isPaid: boolean }) =>
      patchPersonalExpense(id, { isPaid }),
    onMutate: async ({ id, isPaid }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PersonalExpenseListResponse>(queryKey);

      if (previous) {
        const items = previous.items.map((item) =>
          item.id === id
            ? {
                ...item,
                isPaid,
                paidAt: isPaid ? new Date().toISOString() : undefined,
              }
            : item,
        );

        const paidItems = items.filter((item) => item.isPaid);
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        const paidAmount = paidItems.reduce((sum, item) => sum + item.amount, 0);

        queryClient.setQueryData<PersonalExpenseListResponse>(queryKey, {
          items: [...items].sort((a, b) => {
            if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1;
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }),
          summary: {
            ...previous.summary,
            totalAmount,
            paidAmount,
            remainingAmount: totalAmount - paidAmount,
            paidCount: paidItems.length,
            unpaidCount: items.length - paidItems.length,
          },
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => invalidate(),
  });

  return {
    items: query.data?.items ?? [],
    summary: query.data?.summary,
    loading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
    addExpense: createMutation.mutateAsync,
    editExpense: (id: string, input: UpdatePersonalExpenseInput) =>
      updateMutation.mutateAsync({ id, input }),
    removeExpense: deleteMutation.mutateAsync,
    togglePaid: (id: string, isPaid: boolean) =>
      togglePaidMutation.mutateAsync({ id, isPaid }),
    copyFromPrevious: copyMutation.mutateAsync,
    isSaving:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isCopying: copyMutation.isPending,
    isToggling: togglePaidMutation.isPending,
  };
}
