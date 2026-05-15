import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as userService from "@/services/user.service";
import { toErrorResponse } from "@/utils/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await connectMongo();
    const { id } = await context.params;
    const body = await request.json();
    const user = await userService.updateUser(id, body);
    return NextResponse.json(user);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await connectMongo();
    const { id } = await context.params;
    await userService.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
