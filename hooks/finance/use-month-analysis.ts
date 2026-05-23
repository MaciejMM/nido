"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchMonthAnalysis } from "@/lib/finance-api-client";

import { financeKeys } from "./query-keys";

export function useMonthAnalysis(year: number, month: number) {
  return useQuery({
    queryKey: financeKeys.monthAnalysis(year, month),
    queryFn: () => fetchMonthAnalysis(year, month),
    staleTime: 0,
  });
}
