import { NextResponse } from "next/server";
import { z } from "zod";

import {
  isAdminConfigured,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/auth/admin";
import { toErrorResponse, ValidationError } from "@/utils/errors";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Panel admina nie jest skonfigurowany (brak ADMIN_PASSWORD)" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Nieprawidłowe dane logowania");
    }

    if (!verifyAdminPassword(parsed.data.password)) {
      return NextResponse.json({ error: "Nieprawidłowe hasło" }, { status: 401 });
    }

    await setAdminSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
