"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { formatCurrency } from "@/lib/finance/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { pl } from "@/lib/i18n";
import type { PersonalExpenseDto } from "@/types";

interface PersonalExpenseListProps {
  items: PersonalExpenseDto[];
  loading: boolean;
  onEdit: (expense: PersonalExpenseDto) => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePaid: (id: string, isPaid: boolean) => Promise<void>;
  togglingId?: string | null;
}

export function PersonalExpenseList({
  items,
  loading,
  onEdit,
  onDelete,
  onTogglePaid,
  togglingId,
}: PersonalExpenseListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="font-medium">{pl.finance.personalExpenses.empty}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.personalExpenses.emptyHint}
        </p>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
      toast.success(pl.finance.personalExpenses.deleted);
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
        {items.map((item) => {
          const isToggling = togglingId === item.id;
          return (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 ${
                item.isPaid ? "opacity-70" : ""
              }`}
            >
              <Checkbox
                checked={item.isPaid}
                disabled={isToggling}
                onCheckedChange={(checked) =>
                  void onTogglePaid(item.id, checked === true)
                }
                aria-label={
                  item.isPaid
                    ? pl.finance.personalExpenses.markUnpaid
                    : pl.finance.personalExpenses.markPaid
                }
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-medium ${
                    item.isPaid ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.title}
                </p>
                {item.notes && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.notes}
                  </p>
                )}
              </div>
              <p
                className={`shrink-0 font-semibold tabular-nums ${
                  item.isPaid ? "text-muted-foreground" : ""
                }`}
              >
                {formatCurrency(item.amount, item.currency)}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(item)}
                  aria-label={pl.finance.personalExpenses.edit}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteId(item.id)}
                  aria-label={pl.finance.personalExpenses.delete}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pl.finance.personalExpenses.deleteTitle}</DialogTitle>
            <DialogDescription>
              {pl.finance.personalExpenses.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {pl.finance.personalExpenses.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting
                ? pl.finance.personalExpenses.deleting
                : pl.finance.personalExpenses.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
