"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { formatFinanceMonth } from "@/lib/finance/format";
import { Button } from "@/components/ui/button";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export function FinanceMonthSwitcher() {
  const { year, month, setPeriod } = useFinanceUiStore();

  function shift(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setPeriod(d.getFullYear(), d.getMonth() + 1);
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => shift(-1)}
        aria-label="Poprzedni miesiąc"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <p className="text-sm font-medium capitalize">
        {formatFinanceMonth(year, month)}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => shift(1)}
        aria-label="Następny miesiąc"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}
