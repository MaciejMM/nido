"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon, TagsIcon } from "lucide-react";
import { toast } from "sonner";

import { NotificationSettingsForm } from "@/components/finance/NotificationSettingsForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccountBalance } from "@/hooks/finance/use-account-balance";
import { useBudget } from "@/hooks/finance/use-budget";
import { useCategories } from "@/hooks/finance/use-categories";
import { getCategoryIcon } from "@/lib/finance/category-icons";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

const CATEGORY_PREVIEW_MAX = 5;

export default function FinanceSettingsPage() {
  const { year, month } = useFinanceUiStore();
  const { budget, saveBudget, isSaving } = useBudget(year, month);
  const {
    accountBalance,
    saveAccountBalance,
    isSaving: isSavingBalance,
  } = useAccountBalance();
  const { categories, loading: categoriesLoading } = useCategories();
  const [limit, setLimit] = useState("");
  const [balance, setBalance] = useState("");

  const previewCategories = categories.slice(0, CATEGORY_PREVIEW_MAX);
  const moreCategories = categories.length - previewCategories.length;

  useEffect(() => {
    setLimit(budget?.limitAmount != null ? String(budget.limitAmount) : "");
  }, [budget]);

  useEffect(() => {
    setBalance(
      accountBalance?.balance != null ? String(accountBalance.balance) : "",
    );
  }, [accountBalance]);

  const handleSaveBalance = async () => {
    const amount = Number(balance);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error(pl.finance.expenses.fillRequired);
      return;
    }
    try {
      await saveAccountBalance({ balance: amount });
      toast.success(pl.finance.settings.accountBalanceSaved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    }
  };

  const handleSaveBudget = async () => {
    const limitAmount = Number(limit);
    if (!Number.isFinite(limitAmount) || limitAmount < 0) {
      toast.error(pl.finance.expenses.fillRequired);
      return;
    }
    try {
      await saveBudget({ year, month, limitAmount });
      toast.success(pl.finance.settings.budgetSaved);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {pl.finance.settings.title}
        </h1>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <Label>{pl.finance.settings.accountBalance}</Label>
        <p className="text-sm text-muted-foreground">
          {pl.finance.settings.accountBalanceHint}
        </p>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="2744"
        />
        <Button
          onClick={() => void handleSaveBalance()}
          disabled={isSavingBalance}
        >
          {isSavingBalance ? pl.finance.expenses.saving : pl.finance.expenses.save}
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <Label>{pl.finance.settings.budgetLimit}</Label>
        <Input
          type="number"
          min={0}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
        <Button onClick={() => void handleSaveBudget()} disabled={isSaving}>
          {isSaving ? pl.finance.expenses.saving : pl.finance.expenses.save}
        </Button>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TagsIcon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">{pl.finance.settings.categoriesSection}</p>
            <p className="text-sm text-muted-foreground">
              {pl.finance.settings.categoriesHint}
            </p>
          </div>
        </div>

        {categoriesLoading ? (
          <p className="text-sm text-muted-foreground">{pl.common.loading}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">{pl.finance.categories.empty}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              {pl.finance.settings.categoriesCount(categories.length)}
            </p>
            <ul className="flex flex-wrap gap-2" aria-label={pl.finance.settings.categoriesSection}>
              {previewCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <li
                    key={cat.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-sm"
                  >
                    <Icon className="size-3.5 shrink-0" style={{ color: cat.color }} />
                    <span>{cat.name}</span>
                  </li>
                );
              })}
              {moreCategories > 0 && (
                <li className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted-foreground">
                  +{moreCategories}
                </li>
              )}
            </ul>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full justify-between"
          nativeButton={false}
          render={<Link href="/finance/categories" />}
        >
          {pl.finance.settings.manageCategories}
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </section>

      <NotificationSettingsForm />
    </div>
  );
}
