"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchFinanceDashboard } from "@/lib/finance-api-client";

import { financeKeys } from "./query-keys";

export function useFinanceDashboard(year: number, month: number) {
  return useQuery({
    queryKey: financeKeys.dashboard(year, month),
    queryFn: () => fetchFinanceDashboard(year, month),
  });
}
