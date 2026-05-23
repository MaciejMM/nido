import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as categoryService from "@/services/finance/category.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET() {
  try {
    await connectMongo();
    const categories = await categoryService.listCategories();
    return NextResponse.json(categories);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    const category = await categoryService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
