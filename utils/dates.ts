import { format, parseISO } from "date-fns";

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date (YYYY-MM-DD) from a local calendar picker value. */
export function toCalendarDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** UTC midnight for a calendar date (YYYY-MM-DD). */
export function parseCalendarDate(value: string): Date {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Normalize any Date to UTC midnight of its UTC calendar day. */
export function normalizeToUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/**
 * Recover the intended calendar date from a stored Date.
 * Handles legacy entries saved via toISOString() of local-midnight picker values.
 */
export function toStoredCalendarDate(date: Date): Date {
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  if (hours === 0 && minutes === 0 && seconds === 0 && ms === 0) {
    return normalizeToUtcMidnight(date);
  }

  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  if (hours >= 12) {
    return new Date(Date.UTC(y, m, d + 1));
  }
  return new Date(Date.UTC(y, m, d));
}

/** Local-midnight Date for react-day-picker from a stored/API ISO string. */
export function calendarDateToPickerDate(iso: string): Date {
  const stored = toStoredCalendarDate(parseISO(iso));
  return new Date(
    stored.getUTCFullYear(),
    stored.getUTCMonth(),
    stored.getUTCDate(),
  );
}

export function coerceCalendarDate(value: unknown): Date {
  if (typeof value === "string") {
    if (CALENDAR_DATE_PATTERN.test(value)) {
      return parseCalendarDate(value);
    }
    return toStoredCalendarDate(new Date(value));
  }
  if (value instanceof Date) {
    return toStoredCalendarDate(value);
  }
  throw new Error("Invalid date");
}

/** Saturday (6) or Sunday (0) — use with UTC-normalized calendar dates. */
export function isWeekend(date: Date): boolean {
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
}

/** Weekend check for react-day-picker values (local calendar cells). */
export function isWeekendLocal(date: Date): boolean {
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6;
}

/** All UTC calendar weekdays in [start, end] (inclusive). */
export function eachDayInclusive(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cursor = normalizeToUtcMidnight(start);
  const endNorm = normalizeToUtcMidnight(end);

  while (cursor.getTime() <= endNorm.getTime()) {
    if (!isWeekend(cursor)) {
      days.push(cursor);
    }
    cursor = new Date(
      Date.UTC(
        cursor.getUTCFullYear(),
        cursor.getUTCMonth(),
        cursor.getUTCDate() + 1,
      ),
    );
  }

  return days;
}

/** Weekdays only — for UTC-normalized stored dates. */
export function countInclusiveDays(start: Date, end: Date): number {
  return eachDayInclusive(
    normalizeToUtcMidnight(start),
    normalizeToUtcMidnight(end),
  ).length;
}

/** Weekdays only — for local-midnight react-day-picker values. */
export function countInclusiveDaysFromPicker(start: Date, end: Date): number {
  const startCal = parseCalendarDate(toCalendarDateString(start));
  const endCal = parseCalendarDate(toCalendarDateString(end));
  return eachDayInclusive(startCal, endCal).length;
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  const aS = normalizeToUtcMidnight(aStart);
  const aE = normalizeToUtcMidnight(aEnd);
  const bS = normalizeToUtcMidnight(bStart);
  const bE = normalizeToUtcMidnight(bEnd);
  return aS <= bE && bS <= aE;
}

export function toMonthKey(date: Date): string {
  return format(normalizeToUtcMidnight(date), "yyyy-MM");
}

export function getYearBounds(year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, 0, 1)),
    end: new Date(Date.UTC(year, 11, 31)),
  };
}

export function overlapsYear(start: Date, end: Date, year: number): boolean {
  const { start: yearStart, end: yearEnd } = getYearBounds(year);
  const rangeStart = normalizeToUtcMidnight(start);
  const rangeEnd = normalizeToUtcMidnight(end);
  return rangeStart <= yearEnd && rangeEnd >= yearStart;
}

export function countDaysInYear(start: Date, end: Date, year: number): number {
  const { start: yearStart, end: yearEnd } = getYearBounds(year);
  const rangeStart = normalizeToUtcMidnight(start);
  const rangeEnd = normalizeToUtcMidnight(end);
  const clipStart = rangeStart < yearStart ? yearStart : rangeStart;
  const clipEnd = rangeEnd > yearEnd ? yearEnd : rangeEnd;
  if (clipStart > clipEnd) return 0;
  return countInclusiveDays(clipStart, clipEnd);
}

export function eachDayInYear(start: Date, end: Date, year: number): Date[] {
  const { start: yearStart, end: yearEnd } = getYearBounds(year);
  const rangeStart = normalizeToUtcMidnight(start);
  const rangeEnd = normalizeToUtcMidnight(end);
  const clipStart = rangeStart < yearStart ? yearStart : rangeStart;
  const clipEnd = rangeEnd > yearEnd ? yearEnd : rangeEnd;
  if (clipStart > clipEnd) return [];
  return eachDayInclusive(clipStart, clipEnd);
}
