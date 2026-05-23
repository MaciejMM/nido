"use client";

import { getCategoryIcon, CATEGORY_ICON_OPTIONS } from "@/lib/finance/category-icons";
import { cn } from "@/lib/utils";

interface CategoryIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_ICON_OPTIONS.map((name) => {
        const Icon = getCategoryIcon(name);
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
            aria-label={name}
            aria-pressed={selected}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
