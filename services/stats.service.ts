import { CustodyEntry } from "@/models/CustodyEntry";
import { type IUser } from "@/models/User";
import type { MonthlyBreakdownItem, StatsDto, StatsFilters } from "@/types";
import {
  countDaysInYear,
  eachDayInYear,
  overlapsYear,
  toMonthKey,
} from "@/utils/dates";

function collectAvailableYears(
  entries: { startDate: Date; endDate: Date }[],
): number[] {
  const years = new Set<number>([new Date().getFullYear()]);

  for (const entry of entries) {
    const startYear = entry.startDate.getUTCFullYear();
    const endYear = entry.endDate.getUTCFullYear();
    for (let year = startYear; year <= endYear; year += 1) {
      years.add(year);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}

export async function getStats(filters: StatsFilters = {}): Promise<StatsDto> {
  const entries = await CustodyEntry.find()
    .populate<{ ownerId: IUser }>("ownerId")
    .exec();

  const availableYears = collectAvailableYears(
    entries.map((entry) => ({
      startDate: entry.startDate,
      endDate: entry.endDate,
    })),
  );
  const year = filters.year ?? new Date().getFullYear();

  let totalDaysParentA = 0;
  let totalDaysParentB = 0;
  const monthlyMap = new Map<string, { parentA: number; parentB: number }>();

  for (const entry of entries) {
    if (!overlapsYear(entry.startDate, entry.endDate, year)) {
      continue;
    }

    const owner =
      entry.ownerId && typeof entry.ownerId === "object"
        ? entry.ownerId
        : null;

    if (!owner) continue;

    const days = countDaysInYear(entry.startDate, entry.endDate, year);

    if (owner.role === "parentA") {
      totalDaysParentA += days;
    } else {
      totalDaysParentB += days;
    }

    for (const day of eachDayInYear(entry.startDate, entry.endDate, year)) {
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
