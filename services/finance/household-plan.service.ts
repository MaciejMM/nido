import { DEFAULT_CURRENCY } from "@/lib/finance/constants";
import { buildHouseholdPlanView } from "@/lib/finance/household-summary";
import { pl } from "@/lib/i18n";
import {
  copyHouseholdPlanSchema,
  createHouseholdLineSchema,
  listHouseholdPlanQuerySchema,
  updateHouseholdLineSchema,
  updateHouseholdSettingsSchema,
} from "@/lib/validators/finance/household-plan";
import {
  HouseholdPlanLine,
  type IHouseholdPlanLine,
} from "@/models/HouseholdPlanLine";
import { HouseholdPlanSettings } from "@/models/HouseholdPlanSettings";
import { PersonalExpense } from "@/models/PersonalExpense";
import type {
  CopyHouseholdPlanInput,
  CopyHouseholdPlanResult,
  CreateHouseholdLineInput,
  HouseholdLineDto,
  HouseholdPlanDto,
  PersonalInclusionMode,
  UpdateHouseholdLineInput,
  UpdateHouseholdSettingsInput,
} from "@/types";
import { getPreviousMonth } from "@/utils/finance-dates";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";

const DEFAULT_INCLUSION: PersonalInclusionMode = "consolidated";

function toLineDto(line: IHouseholdPlanLine): HouseholdLineDto {
  return {
    id: line._id.toString(),
    year: line.year,
    month: line.month,
    kind: line.kind,
    title: line.title,
    amount: line.amount,
    notes: line.notes,
    sortOrder: line.sortOrder,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString(),
  };
}

async function getOwnedLine(
  id: string,
  kindeUserId: string,
): Promise<IHouseholdPlanLine> {
  const line = await HouseholdPlanLine.findOne({ _id: id, kindeUserId }).exec();
  if (!line) {
    throw new NotFoundError(pl.finance.household.errors.notFound);
  }
  return line;
}

export async function getHouseholdPlan(
  kindeUserId: string,
  year: number,
  month: number,
): Promise<HouseholdPlanDto> {
  const parsed = listHouseholdPlanQuerySchema.safeParse({ year, month });
  if (!parsed.success) {
    throw new ValidationError(
      pl.common.invalidQuery,
      parsed.error.flatten(),
    );
  }

  const { year: planYear, month: planMonth } = parsed.data;

  const [lines, settings, personalExpenses] = await Promise.all([
    HouseholdPlanLine.find({
      kindeUserId,
      year: planYear,
      month: planMonth,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec(),
    HouseholdPlanSettings.findOne({
      kindeUserId,
      year: planYear,
      month: planMonth,
    }).exec(),
    PersonalExpense.find({
      kindeUserId,
      year: planYear,
      month: planMonth,
      visibility: "private",
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec(),
  ]);

  const dtos = lines.map(toLineDto);

  return buildHouseholdPlanView({
    year: planYear,
    month: planMonth,
    personalInclusion: settings?.personalInclusion ?? DEFAULT_INCLUSION,
    incomes: dtos.filter((line) => line.kind === "income"),
    expenses: dtos.filter((line) => line.kind === "expense"),
    personalItems: personalExpenses.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      amount: item.amount,
    })),
    currency: DEFAULT_CURRENCY,
  });
}

export async function createHouseholdLine(
  kindeUserId: string,
  input: CreateHouseholdLineInput,
): Promise<HouseholdLineDto> {
  const parsed = createHouseholdLineSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.household.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const maxSort = await HouseholdPlanLine.findOne({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
    kind: parsed.data.kind,
  })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean()
    .exec();

  const line = await HouseholdPlanLine.create({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
    kind: parsed.data.kind,
    title: parsed.data.title,
    amount: parsed.data.amount,
    notes: parsed.data.notes,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
  });

  return toLineDto(line);
}

export async function updateHouseholdLine(
  kindeUserId: string,
  id: string,
  input: UpdateHouseholdLineInput,
): Promise<HouseholdLineDto> {
  const parsed = updateHouseholdLineSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.household.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const line = await getOwnedLine(id, kindeUserId);
  if (parsed.data.title !== undefined) line.title = parsed.data.title;
  if (parsed.data.amount !== undefined) line.amount = parsed.data.amount;
  if (parsed.data.notes !== undefined) {
    line.notes = parsed.data.notes ?? undefined;
  }
  await line.save();
  return toLineDto(line);
}

export async function deleteHouseholdLine(
  kindeUserId: string,
  id: string,
): Promise<void> {
  const line = await getOwnedLine(id, kindeUserId);
  await line.deleteOne();
}

export async function updateHouseholdSettings(
  kindeUserId: string,
  input: UpdateHouseholdSettingsInput,
): Promise<HouseholdPlanDto> {
  const parsed = updateHouseholdSettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.household.errors.invalid,
      parsed.error.flatten(),
    );
  }

  await HouseholdPlanSettings.findOneAndUpdate(
    {
      kindeUserId,
      year: parsed.data.year,
      month: parsed.data.month,
    },
    { personalInclusion: parsed.data.personalInclusion },
    { upsert: true, returnDocument: "after" },
  ).exec();

  return getHouseholdPlan(kindeUserId, parsed.data.year, parsed.data.month);
}

export async function copyHouseholdPlanFromPrevious(
  kindeUserId: string,
  input: CopyHouseholdPlanInput,
): Promise<CopyHouseholdPlanResult> {
  const parsed = copyHouseholdPlanSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.household.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const currentCount = await HouseholdPlanLine.countDocuments({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
  }).exec();

  if (currentCount > 0) {
    throw new ConflictError(pl.finance.household.errors.targetNotEmpty);
  }

  const previous = getPreviousMonth(parsed.data.year, parsed.data.month);
  const [sourceLines, sourceSettings] = await Promise.all([
    HouseholdPlanLine.find({
      kindeUserId,
      year: previous.year,
      month: previous.month,
    })
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec(),
    HouseholdPlanSettings.findOne({
      kindeUserId,
      year: previous.year,
      month: previous.month,
    }).exec(),
  ]);

  if (sourceLines.length === 0) {
    throw new ConflictError(pl.finance.household.errors.sourceEmpty);
  }

  await HouseholdPlanLine.insertMany(
    sourceLines.map((line) => ({
      kindeUserId,
      year: parsed.data.year,
      month: parsed.data.month,
      kind: line.kind,
      title: line.title,
      amount: line.amount,
      notes: line.notes,
      sortOrder: line.sortOrder,
    })),
  );

  if (sourceSettings) {
    await HouseholdPlanSettings.findOneAndUpdate(
      {
        kindeUserId,
        year: parsed.data.year,
        month: parsed.data.month,
      },
      { personalInclusion: sourceSettings.personalInclusion },
      { upsert: true },
    ).exec();
  }

  return { copied: sourceLines.length };
}
