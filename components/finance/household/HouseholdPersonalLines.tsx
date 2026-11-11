"use client";

import Link from "next/link";

import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import type { HouseholdPersonalLine } from "@/types";

interface HouseholdPersonalLinesProps {
  lines: HouseholdPersonalLine[];
  personalCount: number;
  currency: string;
}

export function HouseholdPersonalLines({
  lines,
  personalCount,
  currency,
}: HouseholdPersonalLinesProps) {
  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          {pl.finance.household.personalEmpty}
        </p>
        <Link
          href="/finance/personal-expenses"
          className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          {pl.finance.household.openPersonal}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">
                {line.source === "consolidated"
                  ? pl.finance.household.consolidatedTitle
                  : line.title}
              </p>
              {line.source === "consolidated" ? (
                <p className="text-xs text-muted-foreground">
                  {pl.finance.household.consolidatedCount(personalCount)}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-sm font-medium tabular-nums">
              {formatCurrency(line.amount, currency)}
            </p>
          </li>
        ))}
      </ul>
      <Link
        href="/finance/personal-expenses"
        className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        {pl.finance.household.openPersonal}
      </Link>
    </div>
  );
}
