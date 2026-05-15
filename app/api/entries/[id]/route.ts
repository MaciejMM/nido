import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import * as entryService from "@/services/entry.service";
import { toErrorResponse } from "@/utils/errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { id } = await context.params;
    const body = await request.json();
    const entry = await entryService.updateEntry(id, body);
    return NextResponse.json(entry);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectMongo();

    const { id } = await context.params;
    await entryService.deleteEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
