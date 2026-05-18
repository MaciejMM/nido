"use client";

import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { pl } from "@/lib/i18n";
import { calendarLocale, dateLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { countInclusiveDaysFromPicker, isWeekendLocal } from "@/utils/dates";

interface DateRangePickerFieldProps {
  startDate?: Date;
  endDate?: Date;
  onRangeChange: (start?: Date, end?: Date) => void;
}

function formatRangeLabel(start?: Date, end?: Date): string {
  if (!start) return pl.entries.pickDateRange;
  if (!end) {
    return `${format(start, "d MMM yyyy", { locale: dateLocale })} — …`;
  }
  return `${format(start, "d MMM yyyy", { locale: dateLocale })} – ${format(end, "d MMM yyyy", { locale: dateLocale })}`;
}

export function DateRangePickerField({
  startDate,
  endDate,
  onRangeChange,
}: DateRangePickerFieldProps) {
  const selected: DateRange | undefined =
    startDate ? { from: startDate, to: endDate } : undefined;

  const weekdayCount =
    startDate && endDate && endDate >= startDate
      ? countInclusiveDaysFromPicker(startDate, endDate)
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-muted-foreground">{pl.entries.dateRange}</Label>
        <div className="rounded-xl border border-border bg-muted/40 px-3.5 py-3">
          <p
            className={cn(
              "min-h-11 text-[0.9375rem] leading-snug font-medium",
              startDate ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {formatRangeLabel(startDate, endDate)}
          </p>
          <p
            className={cn(
              "mt-1.5 min-h-4 text-xs text-muted-foreground",
              weekdayCount === null && "invisible",
            )}
            aria-hidden={weekdayCount === null}
          >
            {weekdayCount !== null
              ? pl.entries.weekdaysCount(weekdayCount)
              : pl.entries.weekdaysCount(0)}
            <span className="mx-1.5 text-border">·</span>
            {pl.entries.weekendsExcluded}
          </p>
        </div>
      </div>

      <Calendar
        mode="range"
        selected={selected}
        onSelect={(range) => onRangeChange(range?.from, range?.to)}
        locale={calendarLocale}
        numberOfMonths={1}
        defaultMonth={startDate ?? endDate}
        modifiers={{ weekend: isWeekendLocal }}
        modifiersClassNames={{
          weekend: "opacity-50",
        }}
        className="rounded-xl border border-border bg-card [--cell-size:calc((100%-1.5rem)/7)]"
      />
    </div>
  );
}
