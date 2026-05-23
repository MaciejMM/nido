import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { budgetQuerySchema } from "@/lib/validators/finance/budget";
import * as analyticsService from "@/services/finance/finance-analytics.service";
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

    const now = new Date();
    const year = parsed.data.year ?? now.getFullYear();
    const month = parsed.data.month ?? now.getMonth() + 1;

    const dashboard = await analyticsService.getBudgetDashboard(year, month);
    return NextResponse.json(dashboard);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
