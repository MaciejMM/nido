import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import {
  expenseImportQuerySchema,
  MAX_EXPENSE_IMPORT_FILE_SIZE,
} from "@/lib/validators/finance/expense-import";
import { importExpensesFromMbankCsv } from "@/services/finance/expense-import.service";
import { toErrorResponse } from "@/utils/errors";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsedQuery = expenseImportQuerySchema.safeParse({
      year: searchParams.get("year"),
      month: searchParams.get("month"),
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          error: pl.finance.errors.invalidImport,
          details: parsedQuery.error.flatten(),
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: pl.finance.expenses.importNoFile },
        { status: 400 },
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: pl.finance.expenses.importInvalidFile },
        { status: 400 },
      );
    }

    if (file.size > MAX_EXPENSE_IMPORT_FILE_SIZE) {
      return NextResponse.json(
        { error: pl.finance.expenses.importFileTooLarge },
        { status: 413 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importExpensesFromMbankCsv({
      csvBuffer: buffer,
      year: parsedQuery.data.year,
      month: parsedQuery.data.month,
    });

    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
