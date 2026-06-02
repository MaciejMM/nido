import type { QueryClient } from "@tanstack/react-query";

import { financeKeys } from "./query-keys";

export function invalidateFinanceMonth(
  queryClient: QueryClient,
  year: number,
  month: number,
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: financeKeys.dashboard(year, month),
    }),
    queryClient.invalidateQueries({
      queryKey: financeKeys.analytics(year, month),
    }),
    queryClient.invalidateQueries({
      queryKey: financeKeys.monthAnalysis(year, month),
    }),
    queryClient.invalidateQueries({
      queryKey: financeKeys.budget(year, month),
    }),
  ]);
}

/** Invalidates list queries and all month-scoped finance / AI caches. */
export function invalidateFinanceData(
  queryClient: QueryClient,
  months: Array<{ year: number; month: number }> = [],
) {
  const uniqueMonths = [
    ...new Map(
      months.map((m) => [`${m.year}-${m.month}`, m] as const),
    ).values(),
  ];

  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["expenses"] }),
    queryClient.invalidateQueries({ queryKey: ["personal-expenses"] }),
    queryClient.invalidateQueries({ queryKey: financeKeys.categories }),
    ...uniqueMonths.map((m) => invalidateFinanceMonth(queryClient, m.year, m.month)),
    ...(uniqueMonths.length === 0
      ? [
          queryClient.invalidateQueries({ queryKey: ["finance-dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["finance-analytics"] }),
          queryClient.invalidateQueries({ queryKey: ["ai-month-analysis"] }),
          queryClient.invalidateQueries({ queryKey: ["budget"] }),
        ]
      : []),
  ]);
}

export function monthFromDate(date: Date): { year: number; month: number } {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
