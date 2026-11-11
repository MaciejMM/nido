"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import type { HouseholdLineDto } from "@/types";

interface HouseholdLineListProps {
  items: HouseholdLineDto[];
  currency: string;
  loading: boolean;
  emptyTitle: string;
  emptyHint: string;
  onEdit: (line: HouseholdLineDto) => void;
  onDelete: (id: string) => Promise<void>;
}

export function HouseholdLineList({
  items,
  currency,
  loading,
  emptyTitle,
  emptyHint,
  onEdit,
  onDelete,
}: HouseholdLineListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-8 text-center">
        <p className="font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
      toast.success(pl.finance.household.deleted);
      setDeleteId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-sm tabular-nums text-muted-foreground">
                {formatCurrency(item.amount, currency)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              aria-label={pl.finance.household.edit}
            >
              <PencilIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(item.id)}
              aria-label={pl.finance.household.delete}
            >
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pl.finance.household.deleteTitle}</DialogTitle>
            <DialogDescription>
              {pl.finance.household.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {pl.finance.household.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting
                ? pl.finance.household.deleting
                : pl.finance.household.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
