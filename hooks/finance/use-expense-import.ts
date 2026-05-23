"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { importExpensesFromCsv } from "@/lib/finance-api-client";

import { invalidateFinanceData } from "./invalidate-finance-queries";

export function useExpenseImport(year: number, month: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importExpensesFromCsv(file, year, month),
    onSuccess: () => {
      void invalidateFinanceData(queryClient, [{ year, month }]);
    },
  });
}
