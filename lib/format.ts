import { format } from "date-fns";

import { dateLocale } from "@/lib/locale";
import { calendarDateToPickerDate } from "@/utils/dates";

export function formatDateRange(start: string, end: string): string {
  const startDate = calendarDateToPickerDate(start);
  const endDate = calendarDateToPickerDate(end);
  return `${format(startDate, "d MMM yyyy", { locale: dateLocale })} – ${format(endDate, "d MMM yyyy", { locale: dateLocale })}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return format(date, "LLL yyyy", { locale: dateLocale });
}
