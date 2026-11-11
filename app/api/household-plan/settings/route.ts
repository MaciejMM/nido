import { NextRequest, NextResponse } from "next/server";

import {
  isKindeUserContext,
  requireKindeUser,
} from "@/lib/auth/require-kinde-user";
import { connectMongo } from "@/lib/db";
import * as householdPlanService from "@/services/finance/household-plan.service";
import { toErrorResponse } from "@/utils/errors";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireKindeUser();
    if (!isKindeUserContext(auth)) return auth;

    await connectMongo();
    const body = await request.json();
    const plan = await householdPlanService.updateHouseholdSettings(
      auth.kindeUserId,
      body,
    );
    return NextResponse.json(plan);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
