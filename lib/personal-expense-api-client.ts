import type {
  ApiErrorBody,
  CopyFromPreviousMonthInput,
  CopyFromPreviousMonthResult,
  CreatePersonalExpenseInput,
  PatchPersonalExpenseInput,
  PersonalExpenseDto,
  PersonalExpenseListResponse,
  UpdatePersonalExpenseInput,
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

export async function fetchPersonalExpenses(
  year: number,
  month: number,
): Promise<PersonalExpenseListResponse> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/personal-expenses${query}`, {
    cache: "no-store",
  });
  return parseResponse<PersonalExpenseListResponse>(response);
}

export async function createPersonalExpense(
  input: CreatePersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const response = await fetch("/api/personal-expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<PersonalExpenseDto>(response);
}

export async function updatePersonalExpense(
  id: string,
  input: UpdatePersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const response = await fetch(`/api/personal-expenses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<PersonalExpenseDto>(response);
}

export async function patchPersonalExpense(
  id: string,
  input: PatchPersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const response = await fetch(`/api/personal-expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<PersonalExpenseDto>(response);
}

export async function deletePersonalExpense(id: string): Promise<void> {
  const response = await fetch(`/api/personal-expenses/${id}`, {
    method: "DELETE",
  });
  await parseResponse<{ success: boolean }>(response);
}

export async function copyPersonalExpensesFromPrevious(
  input: CopyFromPreviousMonthInput,
): Promise<CopyFromPreviousMonthResult> {
  const response = await fetch("/api/personal-expenses/copy-from-previous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<CopyFromPreviousMonthResult>(response);
}
