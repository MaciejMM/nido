"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DateRangePickerField } from "@/components/entries/DateRangePickerField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { XIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { pl } from "@/lib/i18n";
import type {
  CreateEntryInput,
  CustodyEntryDto,
  UpdateEntryInput,
  UserDto,
} from "@/types";
import { countInclusiveDays } from "@/utils/dates";

interface EntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: UserDto[];
  defaultOwnerId?: string | null;
  entry?: CustodyEntryDto | null;
  onSubmit: (input: CreateEntryInput | UpdateEntryInput, id?: string) => Promise<void>;
}

function EntryFormFields({
  users,
  startDate,
  endDate,
  ownerId,
  notes,
  onRangeChange,
  setOwnerId,
  setNotes,
}: {
  users: UserDto[];
  startDate?: Date;
  endDate?: Date;
  ownerId: string;
  notes: string;
  onRangeChange: (start?: Date, end?: Date) => void;
  setOwnerId: (id: string) => void;
  setNotes: (notes: string) => void;
}) {
  return (
    <div className="space-y-5">
      <DateRangePickerField
        startDate={startDate}
        endDate={endDate}
        onRangeChange={onRangeChange}
      />

      <div className="space-y-2">
        <Label>{pl.entries.parent}</Label>
        <Select
          value={ownerId}
          onValueChange={(v) => v && setOwnerId(v)}
          items={users.map((user) => ({ value: user.id, label: user.name }))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={pl.entries.selectParent} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id} label={user.name}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{pl.entries.notesOptional}</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={pl.entries.notesPlaceholder}
          rows={3}
        />
      </div>
    </div>
  );
}

export function EntryForm({
  open,
  onOpenChange,
  users,
  defaultOwnerId,
  entry,
  onSubmit,
}: EntryFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isEdit = Boolean(entry);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [ownerId, setOwnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRangeChange = (start?: Date, end?: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    if (!open) return;

    if (entry) {
      setStartDate(new Date(entry.startDate));
      setEndDate(new Date(entry.endDate));
      setOwnerId(entry.owner?.id ?? entry.ownerId);
      setNotes(entry.notes ?? "");
    } else {
      setStartDate(undefined);
      setEndDate(undefined);
      setOwnerId(defaultOwnerId ?? users[0]?.id ?? "");
      setNotes("");
    }
  }, [open, entry, defaultOwnerId, users]);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !ownerId) {
      toast.error(pl.entries.fillRequired);
      return;
    }

    if (endDate < startDate) {
      toast.error(pl.entries.endBeforeStart);
      return;
    }

    if (countInclusiveDays(startDate, endDate) === 0) {
      toast.error(pl.entries.noWeekdaysInRange);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        startDate,
        endDate,
        ownerId,
        notes: notes.trim() || undefined,
      };

      if (isEdit && entry) {
        await onSubmit(payload, entry.id);
        toast.success(pl.entries.updated);
      } else {
        await onSubmit(payload as CreateEntryInput);
        toast.success(pl.entries.created);
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : pl.entries.somethingWrong);
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? pl.entries.edit : pl.entries.add;
  const fields = (
    <EntryFormFields
      users={users}
      startDate={startDate}
      endDate={endDate}
      ownerId={ownerId}
      notes={notes}
      onRangeChange={handleRangeChange}
      setOwnerId={setOwnerId}
      setNotes={setNotes}
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
        {pl.entries.cancel}
      </Button>
      <Button className="min-w-0 flex-1" onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? pl.entries.saving : isEdit ? pl.entries.saveChanges : pl.entries.add}
      </Button>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-fit">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {fields}
          <DialogFooter>{actions}</DialogFooter>
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
              <SheetTitle className="text-lg">{title}</SheetTitle>
            </SheetHeader>
            <SheetClose
              render={
                <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" />
              }
            >
              <XIcon />
              <span className="sr-only">{pl.entries.cancel}</span>
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
