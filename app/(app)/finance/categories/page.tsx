"use client";

import Link from "next/link";
import { ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CategoryForm } from "@/components/finance/CategoryForm";
import { CategoryLimitEditor } from "@/components/finance/CategoryLimitEditor";
import { CategoryLimitProgress } from "@/components/finance/CategoryLimitProgress";
import { getCategoryIcon } from "@/lib/finance/category-icons";
import { useCategories } from "@/hooks/finance/use-categories";
import { useFinanceAnalytics } from "@/hooks/finance/use-finance-analytics";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FinanceCategoriesPage() {
  const { year, month } = useFinanceUiStore();
  const { categories, addCategory, updateCategoryLimit, removeCategory } =
    useCategories();
  const analytics = useFinanceAnalytics(year, month);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const spendByCategory = new Map(
    (analytics.data?.categoryBreakdown ?? []).map((item) => [item.categoryId, item]),
  );

  const categoryToDelete = categories.find((cat) => cat.id === deleteId);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await removeCategory(deleteId);
      toast.success(pl.finance.categories.deleted);
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/finance/settings" />}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.categories.title}
        </h1>
      </div>

      <CategoryForm onSubmit={addCategory} />

      <ul className="space-y-3">
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">{pl.finance.categories.empty}</p>
        )}
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const spend = spendByCategory.get(cat.id);
          const spent = spend?.amount ?? 0;
          const limitAmount = cat.monthlyLimit;
          const utilizationPercent =
            limitAmount != null && limitAmount > 0
              ? Math.min(100, (spent / limitAmount) * 100)
              : null;

          return (
            <li
              key={cat.id}
              className="space-y-3 rounded-xl border border-border px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-4 shrink-0" style={{ color: cat.color }} />
                <span className="min-w-0 flex-1 font-medium">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteId(cat.id)}
                  aria-label={pl.finance.categories.deleteAria}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
              <CategoryLimitEditor
                category={cat}
                onSave={(id, monthlyLimit) =>
                  updateCategoryLimit({ id, input: { monthlyLimit } })
                }
              />
              {(limitAmount != null && limitAmount > 0) || spent > 0 ? (
                <CategoryLimitProgress
                  categoryName={cat.name}
                  color={cat.color}
                  spent={spent}
                  limitAmount={limitAmount}
                  utilizationPercent={utilizationPercent}
                  compact
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pl.finance.categories.deleteTitle}</DialogTitle>
            <DialogDescription>
              {categoryToDelete
                ? pl.finance.categories.deleteDescription(categoryToDelete.name)
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {pl.finance.categories.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting
                ? pl.finance.categories.deleting
                : pl.finance.categories.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
