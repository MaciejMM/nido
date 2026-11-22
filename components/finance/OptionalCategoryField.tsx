"use client";

import { getCategoryIcon } from "@/lib/finance/category-icons";
import { pl } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExpenseCategoryDto } from "@/types";

const NONE = "__none__";

export function OptionalCategoryField({
  categories,
  value,
  onChange,
}: {
  categories: ExpenseCategoryDto[];
  value: string;
  onChange: (categoryId: string) => void;
}) {
  const selected =
    categories.find((category) => category.id === value) ??
    (value
      ? {
          id: value,
          name: value,
          icon: "Tag",
          color: "currentColor",
        }
      : null);
  const options = selected
    ? [
        selected,
        ...categories.filter((category) => category.id !== selected.id),
      ]
    : categories;

  return (
    <div className="space-y-2">
      <Label>{pl.finance.expenses.category}</Label>
      <Select
        value={value || NONE}
        onValueChange={(next) => onChange(!next || next === NONE ? "" : next)}
        items={[
          { value: NONE, label: pl.finance.expenses.noCategory },
          ...options.map((category) => ({
            value: category.id,
            label: category.name,
          })),
        ]}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={pl.finance.expenses.noCategory} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE} label={pl.finance.expenses.noCategory}>
            {pl.finance.expenses.noCategory}
          </SelectItem>
          {options.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <SelectItem
                key={category.id}
                value={category.id}
                label={category.name}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: category.color }} />
                  {category.name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
