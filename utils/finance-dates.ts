import { getDaysInMonth } from "date-fns";

import { parseCalendarDate } from "@/utils/dates";

export const FINANCE_TIMEZONE = "Europe/Warsaw";

export function getCalendarPartsInTimezone(
  date: Date = new Date(),
  timeZone = FINANCE_TIMEZONE,
): { year: number; month: number; day: number } {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [year, month, day] = formatted.split("-").map(Number);
  return { year, month, day };
}

export function getMonthDateRange(year: number, month: number): {
  start: Date;
  end: Date;
} {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

export function getCalendarDayUtcRange(
  year: number,
  month: number,
  day: number,
): { start: Date; end: Date } {
  const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    start: parseCalendarDate(key),
    end: new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)),
  };
}

export function getDaysInCalendarMonth(year: number, month: number): number {
  return getDaysInMonth(new Date(Date.UTC(year, month - 1, 1)));
}

export function getDaysElapsedInMonth(
  year: number,
  month: number,
  today: Date = new Date(),
  timeZone = FINANCE_TIMEZONE,
): number {
  const daysInMonth = getDaysInCalendarMonth(year, month);
  const { year: y, month: m, day } = getCalendarPartsInTimezone(today, timeZone);

  if (y < year || (y === year && m < month)) return 0;
  if (y > year || (y === year && m > month)) return daysInMonth;
  return day;
}

export function getDaysLeftInMonth(
  year: number,
  month: number,
  today: Date = new Date(),
  timeZone = FINANCE_TIMEZONE,
): number {
  const daysInMonth = getDaysInCalendarMonth(year, month);
  const { year: y, month: m, day } = getCalendarPartsInTimezone(today, timeZone);

  if (y < year || (y === year && m < month)) return daysInMonth;
  if (y > year || (y === year && m > month)) return 0;
  return daysInMonth - day + 1;
}

export function isCurrentMonth(
  year: number,
  month: number,
  today: Date = new Date(),
  timeZone = FINANCE_TIMEZONE,
): boolean {
  const { year: y, month: m } = getCalendarPartsInTimezone(today, timeZone);
  return y === year && m === month;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}
