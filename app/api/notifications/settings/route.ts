import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as pushService from "@/services/finance/push.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET() {
  try {
    await connectMongo();
    const settings = await pushService.getNotificationSettings();
    return NextResponse.json(settings);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    const settings = await pushService.updateNotificationSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
