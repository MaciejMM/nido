import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as yearService from "@/services/year.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET() {
  try {
    await connectMongo();
    const years = await yearService.listYears();
    return NextResponse.json(years);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    const year = await yearService.createYear(body);
    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
