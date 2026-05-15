import { NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as userService from "@/services/user.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET() {
  try {
    await connectMongo();
    const users = await userService.getParents();
    return NextResponse.json(users);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    const body = await request.json();
    const user = await userService.createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
