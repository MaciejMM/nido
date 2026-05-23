import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as pushService from "@/services/finance/push.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const auth = request.headers.get("authorization");
      if (auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    await connectMongo();
    const sent = await pushService.sendReminderNotifications();
    return NextResponse.json({ sent });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
