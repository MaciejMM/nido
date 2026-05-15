"use client";

import { CalendarDaysIcon, HomeIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: pl.nav.dashboard, icon: HomeIcon },
  { href: "/entries", label: pl.nav.entries, icon: CalendarDaysIcon },
  { href: "/admin", label: pl.nav.admin, icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 md:flex md:flex-col">
      <div className="px-4 py-6">
        <p className="text-lg font-semibold tracking-tight">{pl.app.name}</p>
        <p className="text-xs text-muted-foreground">{pl.app.tagline}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

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
    </aside>
  );
}
