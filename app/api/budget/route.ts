import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { budgetQuerySchema } from "@/lib/validators/finance/budget";
import * as budgetService from "@/services/finance/budget.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsed = budgetQuerySchema.safeParse({
      year: searchParams.get("year") ?? undefined,
      month: searchParams.get("month") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const budget = await budgetService.getBudget(
      parsed.data.year,
      parsed.data.month,
    );
    return NextResponse.json(budget);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    const budget = await budgetService.upsertBudget(body);
    return NextResponse.json(budget);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
