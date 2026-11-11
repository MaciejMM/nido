import { NextRequest, NextResponse } from "next/server";

import {
  isKindeUserContext,
  requireKindeUser,
} from "@/lib/auth/require-kinde-user";
import { connectMongo } from "@/lib/db";
import * as householdPlanService from "@/services/finance/household-plan.service";
import { toErrorResponse } from "@/utils/errors";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const { id } = await params;
    const body = await request.json();
    const line = await householdPlanService.updateHouseholdLine(
      auth.kindeUserId,
      id,
      body,
    );
    return NextResponse.json(line);
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
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const { id } = await params;
    await householdPlanService.deleteHouseholdLine(auth.kindeUserId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
