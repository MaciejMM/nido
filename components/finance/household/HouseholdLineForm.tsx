"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { pl } from "@/lib/i18n";
import type {
  CreateHouseholdLineInput,
  HouseholdLineDto,
  HouseholdLineKind,
  UpdateHouseholdLineInput,
} from "@/types";

interface HouseholdLineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  kind: HouseholdLineKind;
  line?: HouseholdLineDto | null;
  onSubmit: (
    input: CreateHouseholdLineInput | UpdateHouseholdLineInput,
    id?: string,
  ) => Promise<void>;
}

export function HouseholdLineForm(props: HouseholdLineFormProps) {
  if (!props.open) return null;

  return (
    <HouseholdLineFormBody
      key={props.line?.id ?? `new-${props.kind}`}
      {...props}
    />
  );
}

function HouseholdLineFormBody({
  open,
  onOpenChange,
  year,
  month,
  kind,
  line,
  onSubmit,
}: HouseholdLineFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEdit = Boolean(line);
  const [amount, setAmount] = useState(line ? String(line.amount) : "");
  const [title, setTitle] = useState(line?.title ?? "");
  const [submitting, setSubmitting] = useState(false);

  const dialogTitle = isEdit
    ? kind === "income"
      ? pl.finance.household.editIncome
      : pl.finance.household.editExpense
    : kind === "income"
      ? pl.finance.household.addIncome
      : pl.finance.household.addExpense;

  const handleSubmit = async () => {
    const parsedAmount = Number.parseFloat(amount);
    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error(pl.finance.household.fillRequired);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && line) {
        await onSubmit(
          { title: title.trim(), amount: parsedAmount },
          line.id,
        );
        toast.success(pl.finance.household.updated);
      } else {
        await onSubmit({
          year,
          month,
          kind,
          title: title.trim(),
          amount: parsedAmount,
        });
        toast.success(pl.finance.household.created);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : pl.common.requestFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fields = (
    <div className={isDesktop ? "space-y-4" : "space-y-5"}>
      <div className="space-y-2">
        <Label htmlFor="household-line-title">
          {pl.finance.household.titleLabel}
        </Label>
        <Input
          id="household-line-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="household-line-amount">
          {pl.finance.household.amount}
        </Label>
        <Input
          id="household-line-amount"
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => onOpenChange(false)}
        disabled={submitting}
      >
        {pl.finance.household.cancel}
      </Button>
      <Button
        className="flex-1"
        disabled={submitting}
        onClick={() => void handleSubmit()}
      >
        {submitting ? pl.finance.household.saving : pl.finance.household.save}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          {fields}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader className="flex flex-row items-center justify-between gap-2">
          <SheetTitle>{dialogTitle}</SheetTitle>
          <SheetClose render={<Button variant="ghost" size="icon-sm" />}>
            <XIcon className="size-4" />
          </SheetClose>
        </SheetHeader>
        <div className="px-4 pb-2">{fields}</div>
        <SheetFooter>{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
