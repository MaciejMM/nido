import { Types } from "mongoose";

import { getCarryoverDebitsFromPreviousMonth } from "@/lib/finance/bank-import/carryover";
import {
  resolveCategoryId,
  resolveCategoryName,
} from "@/lib/finance/bank-import/category-rules";
import { computeImportHash } from "@/lib/finance/bank-import/import-hash";
import type { ParsedBankTransaction } from "@/lib/finance/bank-import/mbank-parser";
import { parseMbankCsvBuffer } from "@/lib/finance/bank-import/mbank-parser";
import { DEFAULT_CURRENCY, DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { pl } from "@/lib/i18n";
import { Expense } from "@/models/Expense";
import type { ImportResult } from "@/types";
import { getMonthDateRange } from "@/utils/finance-dates";
import { ValidationError } from "@/utils/errors";

import * as categoryService from "./category.service";
import * as accountBalanceService from "./account-balance.service";
import * as paycheckService from "./paycheck.service";
import type { ExpenseCategoryDto } from "@/types/finance";

export interface ImportMbankCsvInput {
  csvBuffer: Buffer;
  year: number;
  month: number;
  householdId?: string;
}

function isMongoDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  );
}

function buildImportNotes(
  operationDescription: string,
  sender: string,
  carryoverNote?: string,
): string | undefined {
  const parts = [
    operationDescription.trim(),
    sender.trim(),
    carryoverNote?.trim(),
  ].filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join("\n");
}

interface ImportTransactionOptions {
  transaction: ParsedBankTransaction;
  categories: ExpenseCategoryDto[];
  householdId: string;
  attributedYear?: number;
  attributedMonth?: number;
  carryoverNote?: string;
}

async function importDebitTransaction({
  transaction,
  categories,
  householdId,
  attributedYear,
  attributedMonth,
  carryoverNote,
}: ImportTransactionOptions): Promise<
  "imported" | "duplicatesSkipped" | "carriedFromPreviousMonth" | "invalid"
> {
  const title = transaction.cleanTitle;
  if (!title) return "invalid";

  const amount = Math.abs(transaction.amount);
  const operationDate = transaction.operationDate;
  const importHash = computeImportHash({
    operationDate,
    amount,
    title,
    operationDescription: transaction.operationDescription,
  });

  const existing = await Expense.findOne({ householdId, importHash }).exec();
  if (existing) {
    if (
      attributedYear !== undefined &&
      attributedMonth !== undefined &&
      (existing.attributedYear !== attributedYear ||
        existing.attributedMonth !== attributedMonth)
    ) {
      existing.attributedYear = attributedYear;
      existing.attributedMonth = attributedMonth;
      if (carryoverNote) {
        const notes = existing.notes?.trim();
        existing.notes = notes
          ? `${notes}\n${carryoverNote}`
          : carryoverNote;
      }
      await existing.save();
      return "carriedFromPreviousMonth";
    }
    return "duplicatesSkipped";
  }

  const categoryName = resolveCategoryName(
    title,
    transaction.operationDescription,
  );

  try {
    await Expense.create({
      amount,
      title,
      categoryId: new Types.ObjectId(
        resolveCategoryId(categories, categoryName),
      ),
      date: operationDate,
      notes: buildImportNotes(
        transaction.operationDescription,
        transaction.sender,
        carryoverNote,
      ),
      currency: DEFAULT_CURRENCY,
      householdId,
      importHash,
      importSource: "mbank_csv",
      attributedYear,
      attributedMonth,
    });

    return attributedYear !== undefined ? "carriedFromPreviousMonth" : "imported";
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return "duplicatesSkipped";
    }
    throw error;
  }
}

export async function importExpensesFromMbankCsv({
  csvBuffer,
  year,
  month,
  householdId = DEFAULT_HOUSEHOLD_ID,
}: ImportMbankCsvInput): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    duplicatesSkipped: 0,
    outOfMonthSkipped: 0,
    carriedFromPreviousMonth: 0,
    invalidRows: 0,
  };

  let parsed;
  try {
    parsed = parseMbankCsvBuffer(csvBuffer);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ValidationError(pl.finance.expenses.importInvalidFile);
    }
    throw error;
  }

  result.invalidRows = parsed.invalidRows;

  await Promise.all([
    paycheckService.upsertPaychecksFromTransactions(
      parsed.transactions,
      householdId,
    ),
    accountBalanceService.upsertAccountBalanceFromImport(
      parsed.transactions,
      householdId,
    ),
  ]);

  const categories = await categoryService.listCategories(householdId);
  const { start, end } = getMonthDateRange(year, month);
  const importedInMonth = new Set<string>();

  for (const transaction of parsed.transactions) {
    if (transaction.amount >= 0) {
      continue;
    }

    const operationDate = transaction.operationDate;
    if (operationDate < start || operationDate > end) {
      result.outOfMonthSkipped++;
      continue;
    }

    const title = transaction.cleanTitle;
    if (!title) {
      result.invalidRows++;
      continue;
    }

    const importHash = computeImportHash({
      operationDate,
      amount: Math.abs(transaction.amount),
      title,
      operationDescription: transaction.operationDescription,
    });

    const outcome = await importDebitTransaction({
      transaction,
      categories,
      householdId,
    });

    switch (outcome) {
      case "imported":
        result.imported++;
        importedInMonth.add(importHash);
        break;
      case "duplicatesSkipped":
        result.duplicatesSkipped++;
        break;
      case "carriedFromPreviousMonth":
        result.carriedFromPreviousMonth++;
        break;
      case "invalid":
        result.invalidRows++;
        break;
      default:
        break;
    }
  }

  const carryoverTransactions = getCarryoverDebitsFromPreviousMonth(
    parsed.transactions,
    year,
    month,
  );

  for (const transaction of carryoverTransactions) {
    const operationDate = transaction.operationDate;
    const title = transaction.cleanTitle;
    if (!title) {
      result.invalidRows++;
      continue;
    }

    const importHash = computeImportHash({
      operationDate,
      amount: Math.abs(transaction.amount),
      title,
      operationDescription: transaction.operationDescription,
    });

    if (importedInMonth.has(importHash)) {
      continue;
    }

    const outcome = await importDebitTransaction({
      transaction,
      categories,
      householdId,
      attributedYear: year,
      attributedMonth: month,
      carryoverNote: pl.finance.expenses.importCarryoverNote,
    });

    switch (outcome) {
      case "imported":
      case "carriedFromPreviousMonth":
        result.carriedFromPreviousMonth++;
        break;
      case "duplicatesSkipped":
        result.duplicatesSkipped++;
        break;
      case "invalid":
        result.invalidRows++;
        break;
      default:
        break;
    }
  }

  return result;
}
