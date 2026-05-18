"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";

import { formatDateRange } from "@/lib/format";
import { pl } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CustodyEntryDto } from "@/types";

interface EntryListProps {
  entries: CustodyEntryDto[];
  loading: boolean;
  refreshing?: boolean;
  onEdit: (entry: CustodyEntryDto) => void;
  onDelete: (entry: CustodyEntryDto) => void;
}

function EntryCardSkeleton() {
  return (
    <Card className="rounded-xl">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex shrink-0 gap-1">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function EntryEmptySkeleton() {
  return (
    <Card className="rounded-xl border-dashed">
      <CardContent className="space-y-2 py-12 text-center">
        <Skeleton className="mx-auto h-4 w-40" />
        <Skeleton className="mx-auto h-4 w-56" />
      </CardContent>
    </Card>
  );
}

function EntryListSkeleton({ empty = false }: { empty?: boolean }) {
  if (empty) {
    return <EntryEmptySkeleton />;
  }

  return (
    <div className="space-y-3" aria-busy>
      {Array.from({ length: 3 }).map((_, i) => (
        <EntryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EntryList({
  entries,
  loading,
  refreshing = false,
  onEdit,
  onDelete,
}: EntryListProps) {
  if (loading) {
    return <EntryListSkeleton />;
  }

  if (refreshing && entries.length === 0) {
    return <EntryListSkeleton empty />;
  }

  if (entries.length === 0) {
    return (
      <Card className="rounded-xl border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium">{pl.entries.empty}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {pl.entries.emptyHint}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 transition-opacity duration-150",
        refreshing && "pointer-events-none opacity-60",
      )}
      aria-busy={refreshing}
    >
      {entries.map((entry) => (
        <Card key={entry.id} className="rounded-xl">
          <CardContent className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">
                  {formatDateRange(entry.startDate, entry.endDate)}
                </p>
                <Badge variant="secondary">{entry.days} {pl.days}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.owner?.name ?? pl.entries.unknownParent}
              </p>
              {entry.notes && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {entry.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={pl.entries.editAria}
                onClick={() => onEdit(entry)}
              >
                <PencilIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={pl.entries.deleteAria}
                onClick={() => onDelete(entry)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
