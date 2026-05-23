import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as categoryService from "@/services/finance/category.service";
import { toErrorResponse } from "@/utils/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectMongo();
    const { id } = await params;
    const body = await request.json();
    const category = await categoryService.updateCategory(id, body);
    return NextResponse.json(category);
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
    await categoryService.deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
