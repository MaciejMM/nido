import { NextRequest, NextResponse } from "next/server";

import {
  isKindeUserContext,
  requireKindeUser,
} from "@/lib/auth/require-kinde-user";
import { connectMongo } from "@/lib/db";
import * as personalExpenseService from "@/services/finance/personal-expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const body = await request.json();
    const result = await personalExpenseService.copyFromPreviousMonth(
      auth.kindeUserId,
      body,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
