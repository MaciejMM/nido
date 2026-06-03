import type {
  AccountBalanceDto,
  ApiErrorBody,
  BudgetDashboardDto,
  BulkDeleteExpensesInput,
  BulkDeleteExpensesResult,
  BulkUpdateExpenseCategoryInput,
  BulkUpdateExpenseCategoryResult,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateExpenseInput,
  ExpenseCategoryDto,
  ExpenseDto,
  FinanceAnalyticsDto,
  ImportResult,
  ListExpensesFilters,
  MonthAnalysisDto,
  MonthlyBudgetDto,
  NotificationSettingsDto,
  PushSubscribeInput,
  UpdateExpenseInput,
  UpdateNotificationSettingsInput,
  UpdateAccountBalanceInput,
  UpsertBudgetInput,
} from "@/types";
import { pl } from "@/lib/i18n";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error = data as ApiErrorBody;
    throw new Error(error.error ?? pl.common.requestFailed);
  }
  return data as T;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function fetchExpenses(
  filters: ListExpensesFilters = {},
): Promise<ExpenseDto[]> {
  const query = buildQuery({
    categoryId: filters.categoryId,
    month: filters.month,
    year: filters.year,
    dateFrom: filters.dateFrom?.toISOString(),
    dateTo: filters.dateTo?.toISOString(),
  });
  const response = await fetch(`/api/expenses${query}`, { cache: "no-store" });
  return parseResponse<ExpenseDto[]>(response);
}

export async function createExpense(
  input: CreateExpenseInput,
): Promise<ExpenseDto> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      date: input.date.toISOString(),
    }),
  });
  return parseResponse<ExpenseDto>(response);
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
): Promise<ExpenseDto> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      ...(input.date ? { date: input.date.toISOString() } : {}),
    }),
  });
  return parseResponse<ExpenseDto>(response);
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}

export async function bulkUpdateExpenseCategory(
  input: BulkUpdateExpenseCategoryInput,
): Promise<BulkUpdateExpenseCategoryResult> {
  const response = await fetch("/api/expenses/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<BulkUpdateExpenseCategoryResult>(response);
}

export async function bulkDeleteExpenses(
  input: BulkDeleteExpensesInput,
): Promise<BulkDeleteExpensesResult> {
  const response = await fetch("/api/expenses/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<BulkDeleteExpensesResult>(response);
}

export async function importExpensesFromCsv(
  file: File,
  year: number,
  month: number,
): Promise<ImportResult> {
  const query = buildQuery({ year, month });
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/expenses/import${query}`, {
    method: "POST",
    body: formData,
  });
  return parseResponse<ImportResult>(response);
}

export async function fetchCategories(): Promise<ExpenseCategoryDto[]> {
  const response = await fetch("/api/categories", { cache: "no-store" });
  return parseResponse<ExpenseCategoryDto[]>(response);
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ExpenseCategoryDto> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<ExpenseCategoryDto>(response);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<ExpenseCategoryDto> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<ExpenseCategoryDto>(response);
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}

export async function fetchBudget(
  year?: number,
  month?: number,
): Promise<MonthlyBudgetDto | null> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/budget${query}`, { cache: "no-store" });
  return parseResponse<MonthlyBudgetDto | null>(response);
}

export async function upsertBudget(
  input: UpsertBudgetInput,
): Promise<MonthlyBudgetDto> {
  const response = await fetch("/api/budget", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<MonthlyBudgetDto>(response);
}

export async function fetchAccountBalance(): Promise<AccountBalanceDto | null> {
  const response = await fetch("/api/finance/account-balance", {
    cache: "no-store",
  });
  return parseResponse<AccountBalanceDto | null>(response);
}

export async function updateAccountBalance(
  input: UpdateAccountBalanceInput,
): Promise<AccountBalanceDto> {
  const response = await fetch("/api/finance/account-balance", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<AccountBalanceDto>(response);
}

export async function fetchFinanceDashboard(
  year?: number,
  month?: number,
): Promise<BudgetDashboardDto> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/finance/dashboard${query}`, {
    cache: "no-store",
  });
  return parseResponse<BudgetDashboardDto>(response);
}

export async function fetchFinanceAnalytics(
  year?: number,
  month?: number,
): Promise<FinanceAnalyticsDto> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/finance/analytics${query}`, {
    cache: "no-store",
  });
  return parseResponse<FinanceAnalyticsDto>(response);
}

export async function fetchMonthAnalysis(
  year: number,
  month: number,
): Promise<MonthAnalysisDto> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/ai/month-analysis${query}`, {
    cache: "no-store",
  });
  return parseResponse<MonthAnalysisDto>(response);
}

export async function fetchNotificationSettings(): Promise<NotificationSettingsDto> {
  const response = await fetch("/api/notifications/settings", {
    cache: "no-store",
  });
  return parseResponse<NotificationSettingsDto>(response);
}

export async function updateNotificationSettings(
  input: UpdateNotificationSettingsInput,
): Promise<NotificationSettingsDto> {
  const response = await fetch("/api/notifications/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<NotificationSettingsDto>(response);
}

export async function subscribePush(
  input: PushSubscribeInput,
): Promise<void> {
  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  await parseResponse<{ success: boolean }>(response);
}

export async function unsubscribePush(endpoint?: string): Promise<void> {
  const response = await fetch("/api/notifications/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(endpoint ? { endpoint } : {}),
  });
  await parseResponse<{ success: boolean }>(response);
}

export async function fetchVapidPublicKey(): Promise<string | null> {
  const response = await fetch("/api/notifications/vapid-public-key");
  const data = await parseResponse<{ publicKey: string | null }>(response);
  return data.publicKey;
}

export async function sendTestPush(): Promise<number> {
  const response = await fetch("/api/notifications/test", { method: "POST" });
  const data = await parseResponse<{ sent: number }>(response);
  return data.sent;
}
