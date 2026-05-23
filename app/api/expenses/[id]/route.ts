import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as expenseService from "@/services/finance/expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectMongo();
    const { id } = await params;
    const body = await request.json();
    const expense = await expenseService.updateExpense(id, body);
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
    await connectMongo();
    const { id } = await params;
    await expenseService.deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
