import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { updateAccountBalanceSchema } from "@/lib/validators/finance/account-balance";
import * as accountBalanceService from "@/services/finance/account-balance.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET() {
  try {
    await connectMongo();
    const balance = await accountBalanceService.getAccountBalance();
    return NextResponse.json(balance ?? null);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();

    const body: unknown = await request.json();
    const parsed = updateAccountBalanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const asOf = parsed.data.asOf ?? new Date();
    const balance = await accountBalanceService.setAccountBalance(
      parsed.data.balance,
      asOf,
      "manual",
    );

    return NextResponse.json(balance);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
