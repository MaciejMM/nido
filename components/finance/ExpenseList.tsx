"use client";

import { PencilIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { getCategoryIcon } from "@/lib/finance/category-icons";
import { formatCurrency } from "@/lib/finance/format";
import { dateLocale } from "@/lib/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { pl } from "@/lib/i18n";
import type { ExpenseCategoryDto, ExpenseDto } from "@/types";

interface ExpenseListProps {
  expenses: ExpenseDto[];
  loading: boolean;
  categories: ExpenseCategoryDto[];
  onEdit: (expense: ExpenseDto) => void;
  onDelete: (id: string) => Promise<void>;
  onBulkUpdateCategory: (ids: string[], categoryId: string) => Promise<void>;
}

export function ExpenseList({
  expenses,
  loading,
  categories,
  onEdit,
  onDelete,
  onBulkUpdateCategory,
}: ExpenseListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const [bulkAssigning, setBulkAssigning] = useState(false);

  const visibleIds = useMemo(() => expenses.map((e) => e.id), [expenses]);
  const selectedCount = selectedIds.size;
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(visibleIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkCategoryId("");
  };

  const handleBulkAssign = async () => {
    if (!bulkCategoryId || selectedCount === 0) return;
    setBulkAssigning(true);
    try {
      await onBulkUpdateCategory([...selectedIds], bulkCategoryId);
      toast.success(pl.finance.expenses.bulkCategoryUpdated(selectedCount));
      clearSelection();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setBulkAssigning(false);
    }
  };

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
      setSelectedIds((prev) => {
        if (!prev.has(deleteId)) return prev;
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="mb-3 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-center">
          <p className="text-sm font-medium">
            {pl.finance.expenses.selectedCount(selectedCount)}
          </p>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={bulkCategoryId || undefined}
              onValueChange={(value) => setBulkCategoryId(value ?? "")}
              items={categories.map((c) => ({ value: c.id, label: c.name }))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={pl.finance.expenses.bulkSelectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!bulkCategoryId || bulkAssigning}
              onClick={() => void handleBulkAssign()}
            >
              {bulkAssigning
                ? pl.finance.expenses.bulkAssigning
                : pl.finance.expenses.bulkAssignCategory}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={bulkAssigning}
            >
              {pl.finance.expenses.clearSelection}
            </Button>
          </div>
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 px-1">
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onCheckedChange={(checked) => toggleAll(checked === true)}
          aria-label={pl.finance.expenses.selectAll}
        />
        <span className="text-sm text-muted-foreground">
          {pl.finance.expenses.selectAll}
        </span>
      </div>

      <ul className="space-y-2">
        {expenses.map((expense) => {
          const cat = expense.category;
          const Icon = getCategoryIcon(cat?.icon ?? "Tag");
          const isSelected = selectedIds.has(expense.id);
          return (
            <li
              key={expense.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3"
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  toggleOne(expense.id, checked === true)
                }
                aria-label={expense.title}
              />
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
