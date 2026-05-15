import { NextResponse } from "next/server";

import { isAdminAuthenticated, isAdminConfigured } from "@/lib/auth/admin";

export async function GET() {
  const configured = isAdminConfigured();
  const authenticated = configured ? await isAdminAuthenticated() : false;

  return NextResponse.json({ configured, authenticated });
}
