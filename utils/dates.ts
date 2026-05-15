import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getDay,
} from "date-fns";

export function normalizeToUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

/** Saturday (6) or Sunday (0) in local time. */
export function isWeekend(date: Date): boolean {
  const weekday = getDay(date);
  return weekday === 0 || weekday === 6;
}

/** All calendar days in [start, end], excluding weekends. */
export function eachDayInclusive(start: Date, end: Date): Date[] {
  return eachDayOfInterval({
    start: normalizeToUtcMidnight(start),
    end: normalizeToUtcMidnight(end),
  }).filter((day) => !isWeekend(day));
}

/** Weekdays only (Fri–Mon inclusive → 2 days). */
export function countInclusiveDays(start: Date, end: Date): number {
  return eachDayInclusive(start, end).length;
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
