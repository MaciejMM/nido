import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-constants";

function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim() || undefined;
}

function getSessionToken(): string | undefined {
  return process.env.ADMIN_SESSION_TOKEN?.trim() || undefined;
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword() && getSessionToken());
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export function isValidSessionToken(cookieValue: string | undefined): boolean {
  const expected = getSessionToken();
  if (!expected || !cookieValue) return false;
  return cookieValue === expected;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidSessionToken(session);
}

export async function setAdminSession(): Promise<void> {
  const token = getSessionToken();
  if (!token) {
    throw new Error("ADMIN_SESSION_TOKEN is not configured");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export { ADMIN_SESSION_COOKIE };
