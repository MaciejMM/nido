import {
  BarChart3Icon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  ReceiptIcon,
  type LucideIcon,
} from "lucide-react";

import { pl } from "@/lib/i18n";
import { normalizeAppPathname } from "@/lib/navigation";

export type FinanceNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const financeNavLinks: FinanceNavLink[] = [
  {
    href: "/finance",
    label: pl.finance.nav.dashboard,
    icon: LayoutDashboardIcon,
  },
  {
    href: "/finance/expenses",
    label: pl.finance.nav.expenses,
    icon: ReceiptIcon,
  },
  {
    href: "/finance/personal-expenses",
    label: pl.finance.nav.personalExpenses,
    icon: ListChecksIcon,
  },
  {
    href: "/finance/analytics",
    label: pl.finance.nav.analytics,
    icon: BarChart3Icon,
  },
  {
    href: "/finance/settings",
    label: pl.finance.nav.more,
    icon: MoreHorizontalIcon,
  },
];

export function isFinanceNavActive(pathname: string, href: string): boolean {
  const path = normalizeAppPathname(pathname);
  const target = normalizeAppPathname(href);

  if (target === "/finance") {
    return path === "/finance";
  }
  if (target === "/finance/settings") {
    return (
      path === "/finance/settings" ||
      path.startsWith("/finance/settings/") ||
      path === "/finance/categories" ||
      path.startsWith("/finance/categories/")
    );
  }
  return path === target || path.startsWith(`${target}/`);
}
