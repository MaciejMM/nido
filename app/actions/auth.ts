"use server";

import { revalidatePath } from "next/cache";

import { setActiveUserCookie } from "@/lib/auth/session";

export async function setActiveUser(userId: string) {
  await setActiveUserCookie(userId);
  revalidatePath("/", "layout");
}
