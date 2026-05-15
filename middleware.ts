import { type NextRequest, NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const expected = process.env.ADMIN_SESSION_TOKEN?.trim();
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!expected || session !== expected) {
      return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
