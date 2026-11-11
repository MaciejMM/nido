import { pl } from "@/lib/i18n";
import type {
  ApiErrorBody,
  CopyHouseholdPlanInput,
  CopyHouseholdPlanResult,
  CreateHouseholdLineInput,
  HouseholdLineDto,
  HouseholdPlanDto,
  UpdateHouseholdLineInput,
  UpdateHouseholdSettingsInput,
} from "@/types";

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
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchHouseholdPlan(
  year: number,
  month: number,
): Promise<HouseholdPlanDto> {
  const query = buildQuery({ year, month });
  const response = await fetch(`/api/household-plan${query}`, {
    cache: "no-store",
  });
  return parseResponse<HouseholdPlanDto>(response);
}

export async function createHouseholdLine(
  input: CreateHouseholdLineInput,
): Promise<HouseholdLineDto> {
  const response = await fetch("/api/household-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<HouseholdLineDto>(response);
}

export async function updateHouseholdLine(
  id: string,
  input: UpdateHouseholdLineInput,
): Promise<HouseholdLineDto> {
  const response = await fetch(`/api/household-plan/lines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<HouseholdLineDto>(response);
}

export async function deleteHouseholdLine(id: string): Promise<void> {
  const response = await fetch(`/api/household-plan/lines/${id}`, {
    method: "DELETE",
  });
  await parseResponse<{ ok: boolean }>(response);
}

export async function updateHouseholdSettings(
  input: UpdateHouseholdSettingsInput,
): Promise<HouseholdPlanDto> {
  const response = await fetch("/api/household-plan/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<HouseholdPlanDto>(response);
}

export async function copyHouseholdPlanFromPrevious(
  input: CopyHouseholdPlanInput,
): Promise<CopyHouseholdPlanResult> {
  const response = await fetch("/api/household-plan/copy-from-previous", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<CopyHouseholdPlanResult>(response);
}
