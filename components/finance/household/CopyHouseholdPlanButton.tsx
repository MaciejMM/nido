"use client";

import { CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pl } from "@/lib/i18n";
import { fetchHouseholdPlan } from "@/lib/household-plan-api-client";
import { getPreviousMonth } from "@/utils/finance-dates";

interface CopyHouseholdPlanButtonProps {
  year: number;
  month: number;
  disabled?: boolean;
  loading?: boolean;
  onCopy: (input: { year: number; month: number }) => Promise<{ copied: number }>;
}

export function CopyHouseholdPlanButton({
  year,
  month,
  disabled,
  loading,
  onCopy,
}: CopyHouseholdPlanButtonProps) {
  const [open, setOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [incomeCount, setIncomeCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [sourceEmpty, setSourceEmpty] = useState(false);

  const openDialog = async () => {
    setPreparing(true);
    try {
      const previous = getPreviousMonth(year, month);
      const plan = await fetchHouseholdPlan(previous.year, previous.month);
      setIncomeCount(plan.incomes.length);
      setExpenseCount(plan.expenses.length);
      setSourceEmpty(plan.incomes.length + plan.expenses.length === 0);
      setOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setPreparing(false);
    }
  };

  const confirmCopy = async () => {
    try {
      const result = await onCopy({ year, month });
      toast.success(pl.finance.household.copySuccess(result.copied));
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        disabled={disabled || preparing || loading}
        onClick={() => void openDialog()}
      >
        <CopyIcon />
        {preparing || loading
          ? pl.finance.household.copying
          : pl.finance.household.copyFromPrevious}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pl.finance.household.copyConfirmTitle}</DialogTitle>
            <DialogDescription>
              {sourceEmpty
                ? pl.finance.household.copyEmpty
                : pl.finance.household.copyConfirmDescription(
                    incomeCount,
                    expenseCount,
                  )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {pl.finance.household.cancel}
            </Button>
            <Button
              disabled={sourceEmpty || loading}
              onClick={() => void confirmCopy()}
            >
              {loading
                ? pl.finance.household.copying
                : pl.finance.household.copyFromPrevious}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
