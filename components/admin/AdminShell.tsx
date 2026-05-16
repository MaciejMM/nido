"use client";

import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/admin-api-client";
import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: pl.admin.overview, icon: LayoutDashboardIcon },
  { href: "/admin/users", label: pl.admin.users, icon: UsersIcon },
  { href: "/admin/years", label: pl.admin.years, icon: CalendarRangeIcon },
  { href: "/admin/entries", label: pl.admin.entries, icon: CalendarDaysIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await adminLogout();
    router.refresh();
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 md:flex md:flex-col">
        <div className="px-4 py-6">
          <p className="text-lg font-semibold tracking-tight">{pl.admin.title}</p>
          <p className="text-xs text-muted-foreground">{pl.app.tagline}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <Link
            href="/"
            className="block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            {pl.admin.backToApp}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => void handleLogout()}
          >
            <LogOutIcon className="size-4" />
            {pl.admin.logout}
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
          <p className="text-sm font-medium md:hidden">{pl.admin.title}</p>
          <Button
            variant="outline"
            size="sm"
            className="md:ml-auto"
            onClick={() => void handleLogout()}
          >
            {pl.admin.logout}
          </Button>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
