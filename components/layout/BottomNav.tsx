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

const financeHomeLink = {
  href: "/",
  label: pl.finance.nav.home,
  icon: HomeIcon,
} as const;

interface BottomNavProps {
  showAdmin?: boolean;
}

export function BottomNav({ showAdmin = false }: BottomNavProps) {
  const pathname = normalizeAppPathname(usePathname());
  const inFinance =
    pathname === "/finance" || pathname.startsWith("/finance/");

  if (inFinance) {
    const items = [financeHomeLink, ...financeNavLinks];

    return (
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around gap-0.5 px-1 py-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : isFinanceNavActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] transition-colors sm:text-xs",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5 shrink-0", active && "stroke-[2.5]")} />
                <span className="max-w-full truncate font-medium leading-tight">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  const links = showAdmin ? [...baseLinks, adminLink] : baseLinks;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around gap-0.5 px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/finance"
              ? pathname === "/finance" || pathname.startsWith("/finance/")
              : href === "/care"
                ? pathname === "/care" ||
                  pathname.startsWith("/care/") ||
                  pathname === "/entries"
                : isAppPathActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-5", active && "stroke-[2.5]")} />
              <span className="max-w-full truncate font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
