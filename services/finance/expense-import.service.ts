import { Types } from "mongoose";

import {
  resolveCategoryId,
  resolveCategoryName,
} from "@/lib/finance/bank-import/category-rules";
import { computeImportHash } from "@/lib/finance/bank-import/import-hash";
import { parseMbankCsvBuffer } from "@/lib/finance/bank-import/mbank-parser";
import { DEFAULT_CURRENCY, DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { pl } from "@/lib/i18n";
import { Expense } from "@/models/Expense";
import type { ImportResult } from "@/types";
import { getMonthDateRange } from "@/utils/finance-dates";
import { ValidationError } from "@/utils/errors";

import * as categoryService from "./category.service";

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
): string | undefined {
  const parts = [operationDescription.trim(), sender.trim()].filter(Boolean);
  if (parts.length === 0) return undefined;
  return parts.join("\n");
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

  const categories = await categoryService.listCategories(householdId);
  const { start, end } = getMonthDateRange(year, month);

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

    const amount = Math.abs(transaction.amount);
    const importHash = computeImportHash({
      operationDate,
      amount,
      title,
      operationDescription: transaction.operationDescription,
    });

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
        ),
        currency: DEFAULT_CURRENCY,
        householdId,
        importHash,
        importSource: "mbank_csv",
      });
      result.imported++;
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        result.duplicatesSkipped++;
        continue;
      }
      throw error;
    }
  }

  return result;
}
