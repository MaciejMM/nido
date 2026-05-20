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
}

export function RecentEntries({ entries, loading }: RecentEntriesProps) {
  const recent = entries.slice(0, 5);

  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">{pl.dashboard.recentEntries}</CardTitle>
        <Link
          href="/entries"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {pl.dashboard.viewAll}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}

        {!loading && recent.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {pl.dashboard.empty}
          </p>
        )}

        {!loading &&
          recent.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border/60 px-3 py-3"
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
      </CardContent>
    </Card>
  );
}
