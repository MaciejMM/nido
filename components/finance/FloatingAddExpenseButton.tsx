"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pl } from "@/lib/i18n";
import { useFinanceUiStore } from "@/stores/finance-ui.store";

export function FloatingAddExpenseButton() {
  const setExpenseFormOpen = useFinanceUiStore((s) => s.setExpenseFormOpen);

  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 z-50 size-14 rounded-full shadow-lg md:bottom-8"
      onClick={() => setExpenseFormOpen(true)}
      aria-label={pl.finance.dashboard.addExpense}
    >
      <PlusIcon className="size-6" />
    </Button>
  );
}
