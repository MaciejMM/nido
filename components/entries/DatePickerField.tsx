"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { pl } from "@/lib/i18n";
import { calendarLocale, dateLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  variant?: "inline" | "popover";
}

function formatDateLabel(date?: Date): string {
  if (!date) return pl.entries.pickDate;
  return format(date, "d MMM yyyy", { locale: dateLocale });
}

function DatePickerCalendar({
  value,
  onChange,
  className,
  layout = "inline",
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  className?: string;
  layout?: "inline" | "popover";
}) {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      locale={calendarLocale}
      numberOfMonths={1}
      defaultMonth={value}
      className={cn(
        "rounded-xl border border-border bg-card",
        layout === "popover"
          ? "w-full [--cell-size:2.5rem]"
          : "w-full [--cell-size:calc((100%-1.5rem)/7)]",
        className,
      )}
    />
  );
}

function DatePickerFieldPopover({
  label,
  value,
  onChange,
}: Omit<DatePickerFieldProps, "variant">) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-between px-3 font-normal"
            />
          }
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {formatDateLabel(value)}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto min-w-[20.5rem] p-0"
        >
          <DatePickerCalendar
            layout="popover"
            value={value}
            onChange={(next) => {
              onChange(next);
              setOpen(false);
            }}
            className="border-0 bg-transparent"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerField({
  label,
  value,
  onChange,
  variant = "inline",
}: DatePickerFieldProps) {
  if (variant === "popover") {
    return (
      <DatePickerFieldPopover label={label} value={value} onChange={onChange} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">{label}</Label>
        <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
          <p
            className={cn(
              "min-h-11 text-[0.9375rem] leading-snug font-medium",
              value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {formatDateLabel(value)}
          </p>
        </div>
      </div>

      <DatePickerCalendar value={value} onChange={onChange} />
    </div>
  );
}
