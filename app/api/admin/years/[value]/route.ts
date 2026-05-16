import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as yearService from "@/services/year.service";
import { toErrorResponse } from "@/utils/errors";

type RouteContext = { params: Promise<{ value: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectMongo();
    const { value } = await context.params;
    await yearService.deleteYear(Number(value));
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
