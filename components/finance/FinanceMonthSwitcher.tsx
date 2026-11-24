"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { formatFinanceMonth } from "@/lib/finance/format";
import { pl } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  isCurrentFinancePeriod,
  useFinanceUiStore,
} from "@/stores/finance-ui.store";

export function FinanceMonthSwitcher() {
  const { year, month, setPeriod } = useFinanceUiStore();
  const viewingCurrentMonth = isCurrentFinancePeriod(year, month);

  function shift(delta: number) {
    const d = new Date(year, month - 1 + delta, 1);
    setPeriod(d.getFullYear(), d.getMonth() + 1);
  }

  function goToCurrentMonth() {
    const today = new Date();
    setPeriod(today.getFullYear(), today.getMonth() + 1);
  }

  return (
    <div className="space-y-3">
      {viewingCurrentMonth ? null : (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-50"
        >
          <p>{pl.finance.period.notCurrent}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
          >
            {pl.finance.period.backToCurrent}
          </Button>
        </div>
      )}
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
    </div>
  );
}
