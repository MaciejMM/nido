import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { listExpensesQuerySchema } from "@/lib/validators/finance/expense";
import * as expenseService from "@/services/finance/expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsed = listExpensesQuerySchema.safeParse({
      categoryId: searchParams.get("categoryId") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const expenses = await expenseService.listExpenses(parsed.data);
    return NextResponse.json(expenses);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    const expense = await expenseService.createExpense(body);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
