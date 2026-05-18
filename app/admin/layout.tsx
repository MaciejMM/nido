import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

import { AdminForbidden } from "@/components/admin/AdminForbidden";
import { AdminShell } from "@/components/admin/AdminShell";
import { hasAdminRole } from "@/lib/auth/kinde-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  if (!(await hasAdminRole())) {
    return <AdminForbidden />;
  }

  return <AdminShell>{children}</AdminShell>;
}
