"use client";

import { CopyIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { formatCurrency } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { fetchPersonalExpenses } from "@/lib/personal-expense-api-client";
import type { CopyFromPreviousMonthInput, PersonalExpenseDto } from "@/types";
import { getPreviousMonth } from "@/utils/finance-dates";

interface CopyFromPreviousMonthButtonProps {
  year: number;
  month: number;
  disabled?: boolean;
  loading?: boolean;
  onCopy: (input: CopyFromPreviousMonthInput) => Promise<{ copied: number }>;
}

export function CopyFromPreviousMonthButton({
  year,
  month,
  disabled,
  loading,
  onCopy,
}: CopyFromPreviousMonthButtonProps) {
  const [open, setOpen] = useState(false);
  const [copying, setCopying] = useState(false);
  const [sourceItems, setSourceItems] = useState<PersonalExpenseDto[]>([]);
  const [loadingSource, setLoadingSource] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const sourceMonth = useMemo(
    () => getPreviousMonth(year, month),
    [year, month],
  );

  const loadSourceItems = useCallback(async () => {
    setLoadingSource(true);
    try {
      const { items } = await fetchPersonalExpenses(
        sourceMonth.year,
        sourceMonth.month,
      );
      setSourceItems(items);
      setSelectedIds(new Set(items.map((item) => item.id)));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : pl.finance.personalExpenses.copyLoadError,
      );
      setSourceItems([]);
      setSelectedIds(new Set());
    } finally {
      setLoadingSource(false);
    }
  }, [sourceMonth.year, sourceMonth.month]);

  useEffect(() => {
    if (open) {
      void loadSourceItems();
    } else {
      setSourceItems([]);
      setSelectedIds(new Set());
    }
  }, [open, loadSourceItems]);

  const allSelected =
    sourceItems.length > 0 &&
    sourceItems.every((item) => selectedIds.has(item.id));
  const someSelected =
    selectedIds.size > 0 && !allSelected;
  const selectedCount = selectedIds.size;

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
      setSelectedIds(new Set(sourceItems.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleCopy = async () => {
    if (selectedCount === 0) {
      toast.error(pl.finance.personalExpenses.copyNoSelection);
      return;
    }

    setCopying(true);
    try {
      const result = await onCopy({
        year,
        month,
        expenseIds: [...selectedIds],
      });
      toast.success(pl.finance.personalExpenses.copySuccess(result.copied));
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setCopying(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || loading}
        onClick={() => setOpen(true)}
      >
        <CopyIcon className="mr-2 size-4" />
        {loading
          ? pl.finance.personalExpenses.copying
          : pl.finance.personalExpenses.copyFromPrevious}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col gap-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pl.finance.personalExpenses.copyConfirmTitle}
            </DialogTitle>
            <DialogDescription>
              {pl.finance.personalExpenses.copyConfirmDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-3 py-4">
            {loadingSource ? (
              <div className="space-y-2">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
            ) : sourceItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {pl.finance.personalExpenses.errors.sourceEmpty}
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={(checked) => toggleAll(checked === true)}
                      aria-label={pl.finance.personalExpenses.copySelectAll}
                    />
                    <span className="text-sm text-muted-foreground">
                      {pl.finance.personalExpenses.copySelectAll}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {pl.finance.personalExpenses.copySelectedCount(
                      selectedCount,
                      sourceItems.length,
                    )}
                  </span>
                </div>

                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {sourceItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) =>
                          toggleOne(item.id, checked === true)
                        }
                        aria-label={item.title}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.title}
                        </p>
                        {item.notes && (
                          <p className="truncate text-xs text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {pl.finance.personalExpenses.cancel}
            </Button>
            <Button
              disabled={
                copying ||
                loadingSource ||
                sourceItems.length === 0 ||
                selectedCount === 0
              }
              onClick={() => void handleCopy()}
            >
              {copying
                ? pl.finance.personalExpenses.copying
                : pl.finance.personalExpenses.copyFromPrevious}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
