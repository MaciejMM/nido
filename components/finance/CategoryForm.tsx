"use client";

import { useState } from "react";
import { toast } from "sonner";

import { CategoryIconPicker } from "@/components/finance/CategoryIconPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pl } from "@/lib/i18n";
import type { CreateCategoryInput } from "@/types";

const COLOR_OPTIONS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CategoryFormProps {
  onSubmit: (input: CreateCategoryInput) => Promise<unknown>;
}

export function CategoryForm({ onSubmit }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error(pl.finance.expenses.fillRequired);
      return;
    }
    setSaving(true);
    try {
      const limitTrimmed = monthlyLimit.trim();
      let parsedLimit: number | null = null;
      if (limitTrimmed !== "") {
        parsedLimit = Number.parseFloat(limitTrimmed);
        if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
          toast.error(pl.finance.categories.invalidLimit);
          return;
        }
      }
      await onSubmit({
        name: name.trim(),
        icon,
        color,
        monthlyLimit: parsedLimit,
      });
      toast.success(pl.finance.categories.created);
      setName("");
      setMonthlyLimit("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="space-y-2">
        <Label>{pl.finance.categories.name}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{pl.finance.categories.icon}</Label>
        <CategoryIconPicker value={icon} onChange={setIcon} />
      </div>
      <div className="space-y-2">
        <Label>{pl.finance.categories.monthlyLimit}</Label>
        <Input
          type="number"
          min={0}
          step={1}
          placeholder={pl.finance.categories.limitPlaceholder}
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{pl.finance.categories.color}</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              className="size-8 rounded-full border-2 border-border"
              style={{
                backgroundColor: c,
                outline: color === c ? "2px solid var(--foreground)" : undefined,
              }}
              onClick={() => setColor(c)}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <Button onClick={() => void handleSubmit()} disabled={saving}>
        {saving ? pl.finance.expenses.saving : pl.finance.categories.add}
      </Button>
    </div>
  );
}
