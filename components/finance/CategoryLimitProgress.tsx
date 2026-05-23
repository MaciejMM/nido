"use client";

import { formatCurrency, formatPercent } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CategorySpendItem, ExpenseCategoryDto } from "@/types";

interface CategoryLimitProgressProps {
  categoryName: string;
  color: string;
  spent: number;
  limitAmount: number | null;
  utilizationPercent: number | null;
  compact?: boolean;
}

export function CategoryLimitProgress({
  categoryName,
  color,
  spent,
  limitAmount,
  utilizationPercent,
  compact = false,
}: CategoryLimitProgressProps) {
  const hasLimit = limitAmount != null && limitAmount > 0;
  const percent = utilizationPercent ?? 0;
  const overLimit = hasLimit && spent > limitAmount;

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium truncate">{categoryName}</span>
        <span className="shrink-0 text-muted-foreground tabular-nums">
          {hasLimit ? (
            <>
              {formatCurrency(spent)} / {formatCurrency(limitAmount)}
              {utilizationPercent != null && (
                <span className="ml-1.5 font-medium text-foreground">
                  ({formatPercent(utilizationPercent)})
                </span>
              )}
            </>
          ) : (
            formatCurrency(spent)
          )}
        </span>
      </div>
      {hasLimit ? (
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.min(100, percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${categoryName}: ${formatPercent(percent)}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all",
              overLimit && "bg-destructive",
            )}
            style={{
              width: `${Math.min(100, percent)}%`,
              ...(overLimit
                ? {}
                : { backgroundColor: color }),
            }}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {pl.finance.categories.noLimit}
        </p>
      )}
    </div>
  );
}

export function CategoryLimitProgressList({
  items,
  categories,
}: {
  items: CategorySpendItem[];
  categories?: ExpenseCategoryDto[];
}) {
  const withLimits = items.filter(
    (item) => item.limitAmount != null && item.limitAmount > 0,
  );
  const withoutLimitsFromCategories =
    categories?.filter((c) => c.monthlyLimit == null || c.monthlyLimit <= 0) ??
    [];

  if (withLimits.length === 0 && withoutLimitsFromCategories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {pl.finance.categories.limitsEmpty}
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {withLimits.map((item) => (
        <li key={item.categoryId}>
          <CategoryLimitProgress
            categoryName={item.categoryName}
            color={item.color}
            spent={item.amount}
            limitAmount={item.limitAmount}
            utilizationPercent={item.utilizationPercent}
          />
        </li>
      ))}
      {withLimits.length === 0 &&
        withoutLimitsFromCategories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
          >
            <span>{cat.name}</span>
            <span>{pl.finance.categories.noLimit}</span>
          </li>
        ))}
    </ul>
  );
}
