import { NextRequest, NextResponse } from "next/server";

import {
  isKindeUserContext,
  requireKindeUser,
} from "@/lib/auth/require-kinde-user";
import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { listPersonalExpensesQuerySchema } from "@/lib/validators/finance/personal-expense";
import * as personalExpenseService from "@/services/finance/personal-expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsed = listPersonalExpensesQuerySchema.safeParse({
      year: searchParams.get("year") ?? undefined,
      month: searchParams.get("month") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await personalExpenseService.listPersonalExpenses(
      auth.kindeUserId,
      parsed.data.year,
      parsed.data.month,
    );
    return NextResponse.json(data);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const body = await request.json();
    const expense = await personalExpenseService.createPersonalExpense(
      auth.kindeUserId,
      body,
    );
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
