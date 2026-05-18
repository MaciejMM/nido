import type { ApiErrorBody, TrackingYearDto, UserDto } from "@/types";
import type { CreateYearInput } from "@/lib/validators/year";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validators/user";
import { pl } from "@/lib/i18n";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiErrorBody;
    throw new Error(error.error ?? pl.common.requestFailed);
  }

  return data as T;
}

export async function fetchAdminUsers(): Promise<UserDto[]> {
  const response = await fetch("/api/admin/users", { cache: "no-store" });
  return parseResponse<UserDto[]>(response);
}

export async function createAdminUser(
  input: CreateUserInput,
): Promise<UserDto> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<UserDto>(response);
}

export async function updateAdminUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDto> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<UserDto>(response);
}

export async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
  await parseResponse<{ success: boolean }>(response);
}

export async function fetchAdminYears(): Promise<TrackingYearDto[]> {
  const response = await fetch("/api/admin/years", { cache: "no-store" });
  return parseResponse<TrackingYearDto[]>(response);
}

export async function createAdminYear(
  input: CreateYearInput,
): Promise<TrackingYearDto> {
  const response = await fetch("/api/admin/years", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<TrackingYearDto>(response);
}

export async function deleteAdminYear(value: number): Promise<void> {
  const response = await fetch(`/api/admin/years/${value}`, {
    method: "DELETE",
  });
  await parseResponse<{ success: boolean }>(response);
}
