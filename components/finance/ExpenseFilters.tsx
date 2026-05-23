"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pl } from "@/lib/i18n";
import type { ExpenseCategoryDto } from "@/types";

interface ExpenseFiltersProps {
  categories: ExpenseCategoryDto[];
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function ExpenseFilters({
  categories,
  categoryId,
  onCategoryChange,
}: ExpenseFiltersProps) {
  return (
    <Select
      value={categoryId ?? "__all__"}
      onValueChange={(v) => onCategoryChange(v === "__all__" ? null : v)}
      items={[
        { value: "__all__", label: pl.finance.expenses.filterAll },
        ...categories.map((c) => ({ value: c.id, label: c.name })),
      ]}
    >
      <SelectTrigger className="w-full sm:w-48">
        <SelectValue placeholder={pl.finance.expenses.filterCategory} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__" label={pl.finance.expenses.filterAll}>
          {pl.finance.expenses.filterAll}
        </SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id} label={cat.name}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
