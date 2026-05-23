"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getCategoryIcon } from "@/lib/finance/category-icons";
import { formatCurrency } from "@/lib/finance/format";
import { dateLocale } from "@/lib/locale";
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
import { pl } from "@/lib/i18n";
import type { ExpenseDto } from "@/types";

interface ExpenseListProps {
  expenses: ExpenseDto[];
  loading: boolean;
  onEdit: (expense: ExpenseDto) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseList({
  expenses,
  loading,
  onEdit,
  onDelete,
}: ExpenseListProps) {
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

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="font-medium">{pl.finance.expenses.empty}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {pl.finance.expenses.emptyHint}
        </p>
      </div>
    );
  }

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
      toast.success(pl.finance.expenses.deleted);
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ul className="space-y-2">
        {expenses.map((expense) => {
          const cat = expense.category;
          const Icon = getCategoryIcon(cat?.icon ?? "Tag");
          return (
            <li
              key={expense.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
                style={{ color: cat?.color }}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{expense.title}</p>
                <p className="text-xs text-muted-foreground">
                  {cat?.name} ·{" "}
                  {format(new Date(expense.date), "d MMM yyyy", {
                    locale: dateLocale,
                  })}
                </p>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(expense)}
                  aria-label={pl.finance.expenses.edit}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteId(expense.id)}
                  aria-label={pl.finance.expenses.delete}
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
            <DialogTitle>{pl.finance.expenses.deleteTitle}</DialogTitle>
            <DialogDescription>
              {pl.finance.expenses.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {pl.finance.expenses.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? pl.finance.expenses.deleting : pl.finance.expenses.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
