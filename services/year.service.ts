import { createYearSchema, type CreateYearInput } from "@/lib/validators/year";
import { CustodyEntry } from "@/models/CustodyEntry";
import { TrackingYear, type ITrackingYear } from "@/models/TrackingYear";
import type { TrackingYearDto } from "@/types";
import { overlapsYear, toStoredCalendarDate } from "@/utils/dates";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";

function toYearDto(year: ITrackingYear): TrackingYearDto {
  return {
    id: year._id.toString(),
    value: year.value,
  };
}

function collectYearsFromEntries(
  entries: { startDate: Date; endDate: Date }[],
): number[] {
  const years = new Set<number>();

  for (const entry of entries) {
    const startYear = toStoredCalendarDate(entry.startDate).getUTCFullYear();
    const endYear = toStoredCalendarDate(entry.endDate).getUTCFullYear();
    for (let year = startYear; year <= endYear; year += 1) {
      years.add(year);
    }
  }

  return Array.from(years);
}

export function mergeAvailableYears(
  configuredYears: number[],
  entryYears: number[],
): number[] {
  const years = new Set<number>([
    new Date().getFullYear(),
    ...configuredYears,
    ...entryYears,
  ]);

  return Array.from(years).sort((a, b) => b - a);
}

export async function getAvailableYears(): Promise<number[]> {
  const [configured, entries] = await Promise.all([
    TrackingYear.find().select("value").lean().exec(),
    CustodyEntry.find().select("startDate endDate").lean().exec(),
  ]);

  return mergeAvailableYears(
    configured.map((year) => year.value),
    collectYearsFromEntries(entries),
  );
}

export async function listYears(): Promise<TrackingYearDto[]> {
  const years = await TrackingYear.find().sort({ value: -1 }).exec();
  return years.map(toYearDto);
}

export async function createYear(input: CreateYearInput): Promise<TrackingYearDto> {
  const parsed = createYearSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(
      "Nieprawidłowy rok",
      parsed.error.flatten(),
    );
  }

  const { value } = parsed.data;

  const existing = await TrackingYear.findOne({ value }).exec();
  if (existing) {
    throw new ConflictError(`Rok ${value} jest już dodany`);
  }

  const year = await TrackingYear.create({ value });
  return toYearDto(year);
}

export async function deleteYear(value: number): Promise<void> {
  const parsed = createYearSchema.safeParse({ value });

  if (!parsed.success) {
    throw new ValidationError(
      "Nieprawidłowy rok",
      parsed.error.flatten(),
    );
  }

  const year = await TrackingYear.findOne({ value: parsed.data.value }).exec();
  if (!year) {
    throw new NotFoundError("Nie znaleziono roku");
  }

  const entries = await CustodyEntry.find().select("startDate endDate").exec();
  const hasEntries = entries.some((entry) =>
    overlapsYear(entry.startDate, entry.endDate, parsed.data.value),
  );

  if (hasEntries) {
    throw new ConflictError(
      `Nie można usunąć roku ${parsed.data.value} — istnieją wpisy w tym okresie`,
    );
  }

  await year.deleteOne();
}
