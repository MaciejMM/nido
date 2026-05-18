import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { KindeAccessToken } from "@kinde-oss/kinde-auth-nextjs/types";
import { type NextRequest, NextResponse } from "next/server";

import { hasAdminRoleInToken } from "@/lib/auth/kinde-admin";

type KindeAuthRequest = NextRequest & {
  kindeAuth?: {
    token: KindeAccessToken;
  };
};

function guardAdminApi(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/admin")) {
    return null;
  }

  const token = (request as KindeAuthRequest).kindeAuth?.token;
  if (!token || !hasAdminRoleInToken(token)) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }

  return null;
}

export default withAuth(
  async function proxy(request: NextRequest) {
    const adminResponse = guardAdminApi(request);
    if (adminResponse) {
      return adminResponse;
    }

    return NextResponse.next();
  },
  {
    loginPage: "/api/auth/login",
    isReturnToCurrentPage: true,
    publicPaths: ["/api/auth"],
  },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
