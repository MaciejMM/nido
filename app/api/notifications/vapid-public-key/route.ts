import { NextResponse } from "next/server";

import * as pushService from "@/services/finance/push.service";

export async function GET() {
  const publicKey = pushService.getVapidPublicKey();
  return NextResponse.json({ publicKey });
}
