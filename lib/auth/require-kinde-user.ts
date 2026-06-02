import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";

export type KindeUserContext = {
  kindeUserId: string;
};

export async function requireKindeUser(): Promise<
  KindeUserContext | NextResponse
> {
  const { isAuthenticated, getUser } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const user = await getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  return { kindeUserId: user.id };
}

export function isKindeUserContext(
  result: KindeUserContext | NextResponse,
): result is KindeUserContext {
  return "kindeUserId" in result;
}
