import type { ListExpensesFilters } from "@/types";

export const financeKeys = {
  all: ["finance"] as const,
  expenses: (filters: ListExpensesFilters) =>
    ["expenses", filters] as const,
  categories: ["categories"] as const,
  budget: (year: number, month: number) => ["budget", year, month] as const,
  dashboard: (year: number, month: number) =>
    ["finance-dashboard", year, month] as const,
  analytics: (year: number, month: number) =>
    ["finance-analytics", year, month] as const,
  monthAnalysis: (year: number, month: number) =>
    ["ai-month-analysis", year, month] as const,
  notificationSettings: ["notification-settings"] as const,
};
