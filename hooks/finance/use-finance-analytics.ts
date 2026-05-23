"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchFinanceAnalytics } from "@/lib/finance-api-client";

import { financeKeys } from "./query-keys";

export function useFinanceAnalytics(year: number, month: number) {
  return useQuery({
    queryKey: financeKeys.analytics(year, month),
    queryFn: () => fetchFinanceAnalytics(year, month),
  });
}
