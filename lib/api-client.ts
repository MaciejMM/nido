import type {
  ApiErrorBody,
  CreateEntryInput,
  CustodyEntryDto,
  StatsDto,
  UpdateEntryInput,
  UserDto,
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

export async function fetchUsers(): Promise<UserDto[]> {
  const response = await fetch("/api/users", { cache: "no-store" });
  return parseResponse<UserDto[]>(response);
}

export async function fetchEntries(options?: {
  ownerId?: string;
  year?: number;
}): Promise<CustodyEntryDto[]> {
  const params = new URLSearchParams();
  if (options?.ownerId) params.set("ownerId", options.ownerId);
  if (options?.year) params.set("year", String(options.year));
  const query = params.toString();
  const response = await fetch(`/api/entries${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  return parseResponse<CustodyEntryDto[]>(response);
}

export async function createEntry(
  input: CreateEntryInput,
): Promise<CustodyEntryDto> {
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      startDate: input.startDate.toISOString(),
      endDate: input.endDate.toISOString(),
    }),
  });
  return parseResponse<CustodyEntryDto>(response);
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput,
): Promise<CustodyEntryDto> {
  const response = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      ...(input.startDate ? { startDate: input.startDate.toISOString() } : {}),
      ...(input.endDate ? { endDate: input.endDate.toISOString() } : {}),
    }),
  });
  return parseResponse<CustodyEntryDto>(response);
}

export async function deleteEntry(id: string): Promise<void> {
  const response = await fetch(`/api/entries/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}

export async function fetchStats(year?: number): Promise<StatsDto> {
  const params = year ? `?year=${year}` : "";
  const response = await fetch(`/api/stats${params}`, { cache: "no-store" });
  return parseResponse<StatsDto>(response);
}
