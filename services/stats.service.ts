import { CustodyEntry } from "@/models/CustodyEntry";
import { type IUser } from "@/models/User";
import { getAvailableYears } from "@/services/year.service";
import type { MonthlyBreakdownItem, StatsDto, StatsFilters } from "@/types";
import {
  countDaysInYear,
  eachDayInYear,
  overlapsYear,
  toMonthKey,
  toStoredCalendarDate,
} from "@/utils/dates";

export async function getStats(filters: StatsFilters = {}): Promise<StatsDto> {
  const [entries, availableYears] = await Promise.all([
    CustodyEntry.find()
      .populate<{ ownerId: IUser }>("ownerId")
      .exec(),
    getAvailableYears(),
  ]);
  const year = filters.year ?? new Date().getFullYear();

  let totalDaysParentA = 0;
  let totalDaysParentB = 0;
  const monthlyMap = new Map<string, { parentA: number; parentB: number }>();

  for (const entry of entries) {
    const startDate = toStoredCalendarDate(entry.startDate);
    const endDate = toStoredCalendarDate(entry.endDate);

    if (!overlapsYear(startDate, endDate, year)) {
      continue;
    }

    const owner =
      entry.ownerId && typeof entry.ownerId === "object"
        ? entry.ownerId
        : null;

    if (!owner) continue;

    const days = countDaysInYear(startDate, endDate, year);

    if (owner.role === "parentA") {
      totalDaysParentA += days;
    } else {
      totalDaysParentB += days;
    }

    for (const day of eachDayInYear(startDate, endDate, year)) {
      const monthKey = toMonthKey(day);
      const current = monthlyMap.get(monthKey) ?? { parentA: 0, parentB: 0 };

      if (owner.role === "parentA") {
        current.parentA += 1;
      } else {
        current.parentB += 1;
      }

      monthlyMap.set(monthKey, current);
    }
  }

  const monthlyBreakdown: MonthlyBreakdownItem[] = Array.from(
    monthlyMap.entries(),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, counts]) => ({
      month,
      parentA: counts.parentA,
      parentB: counts.parentB,
      total: counts.parentA + counts.parentB,
    }));

  return {
    totalDaysParentA,
    totalDaysParentB,
    totalDaysCombined: totalDaysParentA + totalDaysParentB,
    monthlyBreakdown,
    availableYears,
  };
}

export { getParentLabel } from "@/lib/i18n";
