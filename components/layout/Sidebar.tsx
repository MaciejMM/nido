"use client";

import {
  HeartHandshakeIcon,
  HomeIcon,
  SettingsIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { financeNavLinks, isFinanceNavActive } from "@/lib/finance/nav-links";
import { pl } from "@/lib/i18n";
import { isAppPathActive, normalizeAppPathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const baseLinks = [
  { href: "/", label: pl.nav.home, icon: HomeIcon },
  { href: "/care", label: pl.nav.care, icon: HeartHandshakeIcon },
  { href: "/finance", label: pl.nav.finance, icon: WalletIcon },
] as const;

const adminLink = {
  href: "/admin",
  label: pl.nav.admin,
  icon: SettingsIcon,
} as const;

interface SidebarProps {
  showAdmin?: boolean;
}

export function Sidebar({ showAdmin = false }: SidebarProps) {
  const pathname = normalizeAppPathname(usePathname());
  const links = showAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 md:flex md:flex-col">
      <div className="px-4 py-6">
        <p className="text-lg font-semibold tracking-tight">{pl.app.name}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/finance"
              ? pathname === "/finance" || pathname.startsWith("/finance/")
              : href === "/care"
                ? pathname === "/care" ||
                  pathname.startsWith("/care/") ||
                  pathname === "/entries"
                : isAppPathActive(pathname, href);
          const inFinance =
            href === "/finance" &&
            (pathname === "/finance" || pathname.startsWith("/finance/"));

          return (
            <div key={href} className="flex flex-col gap-0.5">
              <Link
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
              {inFinance && (
                <div className="relative ml-3 flex flex-col gap-0.5 pl-3">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-foreground/15"
                  />
                  {financeNavLinks.map(({ href: subHref, label: subLabel, icon: SubIcon }) => {
                    const subActive = isFinanceNavActive(pathname, subHref);
                    return (
                      <Link
                        key={subHref}
                        href={subHref}
                        aria-current={subActive ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-2 rounded-lg py-2 pr-2 pl-3 text-sm transition-colors",
                          subActive
                            ? "bg-accent font-medium text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        )}
                      >
                        {subActive ? (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute top-1.5 bottom-1.5 -left-3 w-[2px] rounded-full bg-primary"
                          />
                        ) : null}
                        <SubIcon className="size-3.5 shrink-0" />
                        {subLabel}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
