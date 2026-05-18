"use server";

import { setActiveUserCookie } from "@/lib/auth/session";

export async function setActiveUser(userId: string) {
  await setActiveUserCookie(userId);
}
