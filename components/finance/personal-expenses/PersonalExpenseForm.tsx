"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { pl } from "@/lib/i18n";
import type {
  CreatePersonalExpenseInput,
  PersonalExpenseDto,
  UpdatePersonalExpenseInput,
} from "@/types";

interface PersonalExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  month: number;
  expense?: PersonalExpenseDto | null;
  onSubmit: (
    input: CreatePersonalExpenseInput | UpdatePersonalExpenseInput,
    id?: string,
  ) => Promise<void>;
}

export function PersonalExpenseForm({
  open,
  onOpenChange,
  year,
  month,
  expense,
  onSubmit,
}: PersonalExpenseFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEdit = Boolean(expense);

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (expense) {
      setAmount(String(expense.amount));
      setTitle(expense.title);
      setNotes(expense.notes ?? "");
    } else {
      setAmount("");
      setTitle("");
      setNotes("");
    }
  }, [open, expense]);

  const handleSubmit = async () => {
    const parsedAmount = Number.parseFloat(amount);
    if (!title.trim() || Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error(pl.finance.personalExpenses.fillRequired);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && expense) {
        await onSubmit(
          {
            title: title.trim(),
            amount: parsedAmount,
            notes: notes.trim() || null,
          },
          expense.id,
        );
        toast.success(pl.finance.personalExpenses.updated);
      } else {
        await onSubmit({
          year,
          month,
          title: title.trim(),
          amount: parsedAmount,
          notes: notes.trim() || undefined,
        });
        toast.success(pl.finance.personalExpenses.created);
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
        <Label>{pl.finance.personalExpenses.titleLabel}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>{pl.finance.personalExpenses.amount}</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>{pl.finance.personalExpenses.notes}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={isDesktop ? 3 : 2}
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
        {pl.finance.personalExpenses.cancel}
      </Button>
      <Button className="flex-1" disabled={submitting} onClick={() => void handleSubmit()}>
        {submitting
          ? pl.finance.personalExpenses.saving
          : pl.finance.personalExpenses.save}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? pl.finance.personalExpenses.edit
                : pl.finance.personalExpenses.add}
            </DialogTitle>
          </DialogHeader>
          {fields}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-xl">
        <SheetHeader className="flex flex-row items-center justify-between gap-2">
          <SheetTitle>
            {isEdit
              ? pl.finance.personalExpenses.edit
              : pl.finance.personalExpenses.add}
          </SheetTitle>
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
