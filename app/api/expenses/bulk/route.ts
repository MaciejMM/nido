import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as expenseService from "@/services/finance/expense.service";
import { toErrorResponse } from "@/utils/errors";

export async function PATCH(request: NextRequest) {
  try {
    await connectMongo();
    const { ids, categoryId } = await request.json();
    const result = await expenseService.bulkUpdateExpenseCategory(
      ids,
      categoryId,
    );
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const { ids } = await request.json();
    const result = await expenseService.bulkDeleteExpenses(ids);
    return NextResponse.json(result);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
