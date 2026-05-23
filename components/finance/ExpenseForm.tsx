"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { XIcon } from "lucide-react";

import { DatePickerField } from "@/components/entries/DatePickerField";
import { getCategoryIcon } from "@/lib/finance/category-icons";
import { calendarDateToPickerDate } from "@/utils/dates";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CreateExpenseInput,
  ExpenseCategoryDto,
  ExpenseDto,
  UpdateExpenseInput,
} from "@/types";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategoryDto[];
  expense?: ExpenseDto | null;
  defaultDate?: Date;
  onSubmit: (
    input: CreateExpenseInput | UpdateExpenseInput,
    id?: string,
  ) => Promise<void>;
}

function ExpenseFormFields({
  categories,
  amount,
  setAmount,
  title,
  setTitle,
  categoryId,
  setCategoryId,
  date,
  setDate,
  notes,
  setNotes,
  layout = "mobile",
}: {
  categories: ExpenseCategoryDto[];
  amount: string;
  setAmount: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  date?: Date;
  setDate: (d: Date | undefined) => void;
  notes: string;
  setNotes: (v: string) => void;
  layout?: "mobile" | "desktop";
}) {
  const isDesktop = layout === "desktop";

  const amountField = (
    <div className="space-y-2">
      <Label>{pl.finance.expenses.amount}</Label>
      <Input
        type="number"
        min={0}
        step={0.01}
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
  );

  const titleField = (
    <div className="space-y-2">
      <Label>{pl.finance.expenses.titleLabel}</Label>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
    </div>
  );

  const categoryField = (
    <div className="space-y-2">
      <Label>{pl.finance.expenses.category}</Label>
      <Select
        value={categoryId}
        onValueChange={(v) => v && setCategoryId(v)}
        items={categories.map((c) => ({ value: c.id, label: c.name }))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={pl.finance.expenses.category} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <SelectItem key={cat.id} value={cat.id} label={cat.name}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" style={{ color: cat.color }} />
                  {cat.name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  const notesField = (
    <div className="space-y-2">
      <Label>{pl.finance.expenses.notes}</Label>
      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={isDesktop ? 3 : 2} />
    </div>
  );

  return (
    <div className={isDesktop ? "space-y-4" : "space-y-5"}>
      <DatePickerField
        label={pl.finance.expenses.date}
        value={date}
        onChange={setDate}
        variant={isDesktop ? "popover" : "inline"}
      />
      {isDesktop ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {amountField}
          {titleField}
        </div>
      ) : (
        <>
          {amountField}
          {titleField}
        </>
      )}
      {categoryField}
      {notesField}
    </div>
  );
}

export function ExpenseForm({
  open,
  onOpenChange,
  categories,
  expense,
  defaultDate,
  onSubmit,
}: ExpenseFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEdit = Boolean(expense);

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (expense) {
      setAmount(String(expense.amount));
      setTitle(expense.title);
      setCategoryId(expense.categoryId);
      setDate(calendarDateToPickerDate(expense.date));
      setNotes(expense.notes ?? "");
    } else {
      setAmount("");
      setTitle("");
      setCategoryId(categories[0]?.id ?? "");
      setDate(defaultDate ?? new Date());
      setNotes("");
    }
  }, [open, expense, categories, defaultDate]);

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (!title.trim() || !categoryId || !date || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error(pl.finance.expenses.fillRequired);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parsedAmount,
        title: title.trim(),
        categoryId,
        date,
        notes: notes.trim() || undefined,
      };

      if (isEdit && expense) {
        await onSubmit(payload, expense.id);
        toast.success(pl.finance.expenses.updated);
      } else {
        await onSubmit(payload as CreateExpenseInput);
        toast.success(pl.finance.expenses.created);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.common.requestFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const formTitle = isEdit ? pl.finance.expenses.edit : pl.finance.expenses.add;
  const fields = (
    <ExpenseFormFields
      categories={categories}
      amount={amount}
      setAmount={setAmount}
      title={title}
      setTitle={setTitle}
      categoryId={categoryId}
      setCategoryId={setCategoryId}
      date={date}
      setDate={setDate}
      notes={notes}
      setNotes={setNotes}
      layout={isDesktop ? "desktop" : "mobile"}
    />
  );

  const actions = (
    <>
      <Button
        variant="outline"
        className="min-w-0 flex-1"
        onClick={() => onOpenChange(false)}
        disabled={submitting}
      >
        {pl.finance.expenses.cancel}
      </Button>
      <Button
        className="min-w-0 flex-1"
        onClick={() => void handleSubmit()}
        disabled={submitting}
      >
        {submitting ? pl.finance.expenses.saving : pl.finance.expenses.save}
      </Button>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-lg">{formTitle}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">{fields}</div>
          <DialogFooter className="-mx-0 -mb-0 flex-row gap-3 border-t bg-muted/30 px-6 pb-6 pt-4">
            {actions}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex shrink-0 flex-col items-center border-b border-border/70 px-4 pb-3 pt-2">
          <div
            aria-hidden
            className="mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30"
          />
          <div className="flex w-full items-center justify-between gap-3">
            <SheetHeader className="p-0">
              <SheetTitle className="text-lg">{formTitle}</SheetTitle>
            </SheetHeader>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" />
              }
            >
              <XIcon />
              <span className="sr-only">{pl.finance.expenses.cancel}</span>
            </SheetClose>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {fields}
        </div>
        <SheetFooter className="mt-0 shrink-0 flex-row gap-2 border-t border-border/70 bg-muted/30 p-4 backdrop-blur-sm">
          {actions}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
