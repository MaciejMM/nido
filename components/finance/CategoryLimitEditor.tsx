"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pl } from "@/lib/i18n";
import type { ExpenseCategoryDto } from "@/types";

function formatLimitInput(monthlyLimit: number | null | undefined): string {
  return monthlyLimit != null && monthlyLimit > 0
    ? String(monthlyLimit)
    : "";
}

function parseLimitInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed < 0) return Number.NaN;
  return parsed > 0 ? parsed : null;
}

interface CategoryLimitEditorProps {
  category: ExpenseCategoryDto;
  onSave: (
    id: string,
    monthlyLimit: number | null,
  ) => Promise<ExpenseCategoryDto>;
}

export function CategoryLimitEditor({
  category,
  onSave,
}: CategoryLimitEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(() => formatLimitInput(category.monthlyLimit));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(formatLimitInput(category.monthlyLimit));
  }, [category.id]);

  const handleSave = async () => {
    const raw = inputRef.current?.value ?? value;
    const monthlyLimit = parseLimitInput(raw);

    if (Number.isNaN(monthlyLimit)) {
      toast.error(pl.finance.categories.invalidLimit);
      return;
    }

    setSaving(true);
    try {
      const updated = await onSave(category.id, monthlyLimit);
      setValue(formatLimitInput(updated.monthlyLimit));
      toast.success(pl.finance.categories.limitSaved);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        placeholder={pl.finance.categories.limitPlaceholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void handleSave();
          }
        }}
        className="h-8 w-28"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void handleSave()}
        disabled={saving}
      >
        {saving ? pl.finance.expenses.saving : pl.finance.categories.saveLimit}
      </Button>
    </div>
  );
}
