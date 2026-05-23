import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import {
  pushSubscribeSchema,
  pushUnsubscribeSchema,
} from "@/lib/validators/finance/notification";
import * as pushService from "@/services/finance/push.service";
import { toErrorResponse } from "@/utils/errors";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json();
    const parsed = pushSubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await pushService.savePushSubscription(parsed.data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const body = await request.json().catch(() => ({}));
    const parsed = pushUnsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await pushService.removePushSubscription(parsed.data.endpoint);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
