import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as pushService from "@/services/finance/push.service";
import { toErrorResponse } from "@/utils/errors";

export async function POST() {
  try {
    await connectMongo();
    const sent = await pushService.sendTestNotification();
    return NextResponse.json({ sent });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
