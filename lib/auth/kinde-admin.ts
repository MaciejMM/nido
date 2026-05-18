import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { KindeAccessToken } from "@kinde-oss/kinde-auth-nextjs/types";
import { NextResponse } from "next/server";

export const ADMIN_ROLE_KEY = "admin:role";

function roleListIncludesAdmin(roles: unknown): boolean {
  if (!roles || !Array.isArray(roles)) return false;

  return roles.some((role) => {
    if (typeof role === "string") return role === ADMIN_ROLE_KEY;
    if (role && typeof role === "object" && "key" in role) {
      return (role as { key?: string }).key === ADMIN_ROLE_KEY;
    }
    return false;
  });
}

export function hasAdminRoleInToken(token: KindeAccessToken): boolean {
  return roleListIncludesAdmin(token.roles);
}

export async function hasAdminRole(): Promise<boolean> {
  const { isAuthenticated, getRoles } = getKindeServerSession();
  if (!(await isAuthenticated())) return false;

  const roles = await getRoles();
  return roleListIncludesAdmin(roles);
}

export async function requireAdminResponse(): Promise<NextResponse | null> {
  if (!(await hasAdminRole())) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 403 });
  }
  return null;
}
