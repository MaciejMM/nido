import { createHash } from "crypto";

import { toCalendarDateString } from "@/utils/dates";

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function formatAmount(amount: number): string {
  return Math.abs(amount).toFixed(2);
}

export interface ImportHashInput {
  operationDate: Date;
  amount: number;
  title: string;
  operationDescription: string;
}

export function computeImportHash(input: ImportHashInput): string {
  const canonical = {
    operationDate: toCalendarDateString(input.operationDate),
    amount: formatAmount(input.amount),
    title: normalizeText(input.title),
    operationDescription: normalizeText(input.operationDescription),
  };

  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}
