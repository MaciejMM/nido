import { cookies } from "next/headers";

import type { UserRole } from "@/models/User";

export const ACTIVE_USER_COOKIE = "custody-active-user-id";

export interface SessionUser {
  id: string;
  name: string;
  role: UserRole;
}

export async function getActiveUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_USER_COOKIE)?.value ?? null;
}

export async function setActiveUserCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_USER_COOKIE, userId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
