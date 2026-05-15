import { Types } from "mongoose";

import {
  createEntrySchema,
  updateEntrySchema,
} from "@/lib/validators/entry";
import { CustodyEntry, type ICustodyEntry } from "@/models/CustodyEntry";
import { User, type IUser } from "@/models/User";
import type {
  CreateEntryInput,
  CustodyEntryDto,
  ListEntriesFilters,
  UpdateEntryInput,
} from "@/types";
import {
  countDaysInYear,
  countInclusiveDays,
  overlapsYear,
} from "@/utils/dates";
import { pl } from "@/lib/i18n";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";

function resolveOwnerId(
  ownerId: ICustodyEntry["ownerId"] | IUser,
  owner?: IUser,
): string {
  if (owner?._id) {
    return owner._id.toString();
  }

  if (ownerId && typeof ownerId === "object" && "_id" in ownerId) {
    return (ownerId as IUser)._id.toString();
  }

  return String(ownerId);
}

function toEntryDto(
  entry: ICustodyEntry,
  owner?: IUser,
  year?: number,
): CustodyEntryDto {
  const days = year
    ? countDaysInYear(entry.startDate, entry.endDate, year)
    : countInclusiveDays(entry.startDate, entry.endDate);

  return {
    id: entry._id.toString(),
    startDate: entry.startDate.toISOString(),
    endDate: entry.endDate.toISOString(),
    ownerId: resolveOwnerId(entry.ownerId, owner),
    owner: owner
      ? {
          id: owner._id.toString(),
          name: owner.name,
          email: owner.email,
          role: owner.role,
        }
      : undefined,
    notes: entry.notes,
    days,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function assertNoOverlap(
  ownerId: string,
  start: Date,
  end: Date,
  excludeId?: string,
): Promise<void> {
  const filter: Record<string, unknown> = {
    ownerId: new Types.ObjectId(ownerId),
    startDate: { $lte: end },
    endDate: { $gte: start },
  };

  if (excludeId) {
    filter._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const overlapping = await CustodyEntry.findOne(filter).exec();

  if (overlapping) {
    throw new ConflictError(pl.common.overlap);
  }
}

export async function listEntries(
  filters: ListEntriesFilters = {},
): Promise<CustodyEntryDto[]> {
  const query: Record<string, unknown> = {};

  if (filters.ownerId) {
    query.ownerId = new Types.ObjectId(filters.ownerId);
  }

  const entries = await CustodyEntry.find(query)
    .populate<{ ownerId: IUser }>("ownerId")
    .sort({ startDate: -1 })
    .exec();

  return entries
    .filter((entry) =>
      filters.year
        ? overlapsYear(entry.startDate, entry.endDate, filters.year)
        : true,
    )
    .map((entry) => {
      const owner =
        entry.ownerId && typeof entry.ownerId === "object"
          ? (entry.ownerId as IUser)
          : undefined;
      return toEntryDto(
        entry as unknown as ICustodyEntry,
        owner,
        filters.year,
      );
    });
}

export async function getEntryById(id: string): Promise<CustodyEntryDto> {
  const entry = await CustodyEntry.findById(id)
    .populate<{ ownerId: IUser }>("ownerId")
    .exec();

  if (!entry) {
    throw new NotFoundError(pl.common.entryNotFound);
  }

  const owner =
    entry.ownerId && typeof entry.ownerId === "object"
      ? (entry.ownerId as IUser)
      : undefined;

  return toEntryDto(entry as unknown as ICustodyEntry, owner);
}

export async function createEntry(input: CreateEntryInput): Promise<CustodyEntryDto> {
  const parsed = createEntrySchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(pl.common.invalidEntryData, parsed.error.flatten());
  }

  const { startDate, endDate, ownerId, notes } = parsed.data;

  const owner = await User.findById(ownerId).exec();
  if (!owner) {
    throw new NotFoundError(pl.common.ownerNotFound);
  }

  await assertNoOverlap(ownerId, startDate, endDate);

  if (countInclusiveDays(startDate, endDate) === 0) {
    throw new ValidationError(pl.entries.noWeekdaysInRange);
  }

  const entry = await CustodyEntry.create({
    startDate,
    endDate,
    ownerId: new Types.ObjectId(ownerId),
    notes,
  });

  return toEntryDto(entry, owner);
}

export async function updateEntry(
  id: string,
  input: UpdateEntryInput,
): Promise<CustodyEntryDto> {
  const parsed = updateEntrySchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(pl.common.invalidEntryData, parsed.error.flatten());
  }

  const entry = await CustodyEntry.findById(id).exec();
  if (!entry) {
    throw new NotFoundError(pl.common.entryNotFound);
  }

  const startDate = parsed.data.startDate ?? entry.startDate;
  const endDate = parsed.data.endDate ?? entry.endDate;
  const ownerId = parsed.data.ownerId ?? resolveOwnerId(entry.ownerId);

  if (endDate < startDate) {
    throw new ValidationError(pl.entries.endBeforeStart);
  }

  const owner = await User.findById(ownerId).exec();
  if (!owner) {
    throw new NotFoundError(pl.common.ownerNotFound);
  }

  await assertNoOverlap(ownerId, startDate, endDate, id);

  if (countInclusiveDays(startDate, endDate) === 0) {
    throw new ValidationError(pl.entries.noWeekdaysInRange);
  }

  if (parsed.data.startDate) entry.startDate = parsed.data.startDate;
  if (parsed.data.endDate) entry.endDate = parsed.data.endDate;
  if (parsed.data.ownerId) {
    entry.ownerId = new Types.ObjectId(parsed.data.ownerId);
  }
  if (parsed.data.notes !== undefined) entry.notes = parsed.data.notes;

  await entry.save();

  return toEntryDto(entry, owner);
}

export async function deleteEntry(id: string): Promise<void> {
  const result = await CustodyEntry.findByIdAndDelete(id).exec();

  if (!result) {
    throw new NotFoundError(pl.common.entryNotFound);
  }
}
