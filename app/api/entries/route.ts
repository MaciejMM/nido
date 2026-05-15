import { NextRequest, NextResponse } from "next/server";

import { connectMongo } from "@/lib/db";
import { pl } from "@/lib/i18n";
import { listEntriesQuerySchema } from "@/lib/validators/entry";
import * as entryService from "@/services/entry.service";
import { toErrorResponse } from "@/utils/errors";

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const parsed = listEntriesQuerySchema.safeParse({
      ownerId: searchParams.get("ownerId") ?? undefined,
      year: searchParams.get("year") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: pl.common.invalidQuery, details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const entries = await entryService.listEntries(parsed.data);
    return NextResponse.json(entries);
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const body = await request.json();
    const entry = await entryService.createEntry(body);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
