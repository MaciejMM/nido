import { NextRequest, NextResponse } from "next/server";

import {
  isKindeUserContext,
  requireKindeUser,
} from "@/lib/auth/require-kinde-user";
import { connectMongo } from "@/lib/db";
import * as personalExpenseService from "@/services/finance/personal-expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const { id } = await params;
    const body = await request.json();
    const expense = await personalExpenseService.updatePersonalExpense(
      auth.kindeUserId,
      id,
      body,
    );
    return NextResponse.json(expense);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const { id } = await params;
    const body = await request.json();
    const expense = await personalExpenseService.patchPersonalExpense(
      auth.kindeUserId,
      id,
      body,
    );
    return NextResponse.json(expense);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const { id } = await params;
    await personalExpenseService.deletePersonalExpense(auth.kindeUserId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
