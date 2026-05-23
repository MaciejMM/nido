import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { monthAnalysisQuerySchema } from "@/lib/validators/finance/notification";
import * as financialAgent from "@/services/ai/financial-agent.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsed = monthAnalysisQuerySchema.safeParse({
      year: searchParams.get("year"),
      month: searchParams.get("month"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const analysis = await financialAgent.getMonthAnalysis(
      parsed.data.year,
      parsed.data.month,
    );
    return NextResponse.json(analysis);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
