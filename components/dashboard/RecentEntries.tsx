"use client";

import Link from "next/link";
import { formatDateRange } from "@/lib/format";
import { pl } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustodyEntryDto } from "@/types";

interface RecentEntriesProps {
  entries: CustodyEntryDto[];
  loading: boolean;
  /** Inline list inside a parent card (e.g. home overview) */
  variant?: "card" | "embedded";
  maxItems?: number;
}

function EntryRows({
  entries,
  loading,
}: {
  entries: CustodyEntryDto[];
  loading: boolean;
}) {
  return (
    <>
      {loading &&
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}

      {!loading && entries.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          {pl.dashboard.empty}
        </p>
      )}

      {!loading &&
        entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {formatDateRange(entry.startDate, entry.endDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry.owner?.name ?? pl.entries.unknownParent}
              </p>
            </div>
            <Badge variant="secondary">
              {pl.entries.weekdaysBadge(entry.days)}
            </Badge>
          </div>
        ))}
    </>
  );
}

export function RecentEntries({
  entries,
  loading,
  variant = "card",
  maxItems = 5,
}: RecentEntriesProps) {
  const recent = entries.slice(0, maxItems);

  if (variant === "embedded") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {pl.dashboard.recentEntries}
        </p>
        <div className="space-y-2">
          <EntryRows entries={recent} loading={loading} />
        </div>
      </div>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">{pl.dashboard.recentEntries}</CardTitle>
        <Link
          href="/care"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {pl.dashboard.viewAll}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <EntryRows entries={recent} loading={loading} />
      </CardContent>
    </Card>
  );
}
