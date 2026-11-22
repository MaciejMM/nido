import { Types } from "mongoose";

import { personLabel, soleRemainingName } from "@/lib/auth/person-name";
import { DEFAULT_CURRENCY, DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { categoryObjectId, readStoredCategory } from "@/lib/finance/read-category";
import {
  buildHouseholdPlanView,
  type HouseholdPersonalOwner,
} from "@/lib/finance/household-summary";
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
import { HouseholdMember } from "@/models/HouseholdMember";
import { User } from "@/models/User";
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
import * as categoryService from "@/services/finance/category.service";

const DEFAULT_INCLUSION: PersonalInclusionMode = "consolidated";

function toLineDto(
  line: IHouseholdPlanLine,
  categories?: Map<string, HouseholdLineDto["category"]>,
): HouseholdLineDto {
  const stored =
    line.kind === "expense" ? readStoredCategory(line.categoryId) : {};
  const category =
    stored.category ??
    (stored.categoryId ? categories?.get(stored.categoryId) : undefined);

  return {
    id: line._id.toString(),
    year: line.year,
    month: line.month,
    kind: line.kind,
    title: line.title,
    amount: line.amount,
    notes: line.notes,
    sortOrder: line.sortOrder,
    ...(stored.categoryId ? { categoryId: stored.categoryId } : {}),
    ...(category ? { category } : {}),
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt.toISOString(),
  };
}

async function categoriesForLines(
  lines: IHouseholdPlanLine[],
): Promise<Map<string, HouseholdLineDto["category"]>> {
  return categoryService.loadCategoriesByIds(
    lines.flatMap((line) => {
      if (line.kind !== "expense") return [];
      const categoryId = readStoredCategory(line.categoryId).categoryId;
      return categoryId ? [categoryId] : [];
    }),
  );
}

async function categoryForExpenseLine(
  kind: "income" | "expense",
  categoryId: string | null | undefined,
): Promise<Types.ObjectId | null | undefined> {
  if (kind !== "expense" || categoryId === undefined) return undefined;
  if (!categoryId) return null;
  return categoryService.requireCategoryObjectId(categoryId);
}

function sharedMonthFilter(year: number, month: number) {
  return {
    year,
    month,
    $or: [
      { householdId: DEFAULT_HOUSEHOLD_ID },
      { householdId: { $exists: false } },
      { householdId: null },
    ],
  };
}

async function getSharedLine(id: string): Promise<IHouseholdPlanLine> {
  const line = await HouseholdPlanLine.findById(id).exec();
  if (
    !line ||
    (line.householdId && line.householdId !== DEFAULT_HOUSEHOLD_ID)
  ) {
    throw new NotFoundError(pl.finance.household.errors.notFound);
  }
  return line;
}

async function rememberMember(
  kindeUserId: string,
  displayName?: string,
): Promise<void> {
  const name = personLabel(displayName);
  if (!name) return;

  await HouseholdMember.findOneAndUpdate(
    { kindeUserId },
    { displayName: name },
    { upsert: true },
  ).exec();
}

function ownerLabel(
  ownerId: string,
  viewerId: string,
  viewerName: string | undefined,
  storedNames: Map<string, string>,
): string {
  const stored = personLabel(storedNames.get(ownerId));
  if (stored) return stored;
  if (ownerId === viewerId && viewerName) return viewerName;
  if (ownerId === viewerId) return pl.finance.household.you;
  return pl.finance.household.otherPerson;
}

export async function getHouseholdPlan(
  kindeUserId: string,
  year: number,
  month: number,
  displayName?: string,
): Promise<HouseholdPlanDto> {
  const parsed = listHouseholdPlanQuerySchema.safeParse({ year, month });
  if (!parsed.success) {
    throw new ValidationError(
      pl.common.invalidQuery,
      parsed.error.flatten(),
    );
  }

  const { year: planYear, month: planMonth } = parsed.data;

  await rememberMember(kindeUserId, displayName);

  const [lines, settingsList, personalExpenses] = await Promise.all([
    HouseholdPlanLine.find(sharedMonthFilter(planYear, planMonth))
      .populate("categoryId")
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec(),
    HouseholdPlanSettings.find({
      year: planYear,
      month: planMonth,
    }).exec(),
    PersonalExpense.find({
      year: planYear,
      month: planMonth,
      visibility: "private",
    })
      .populate("categoryId")
      .sort({ sortOrder: 1, createdAt: 1 })
      .exec(),
  ]);

  const ownerIds = [
    ...new Set(personalExpenses.map((item) => item.kindeUserId)),
  ];
  const members = ownerIds.length
    ? await HouseholdMember.find({ kindeUserId: { $in: ownerIds } }).exec()
    : [];
  await Promise.all(
    members.map(async (member) => {
      const resolved = personLabel(member.displayName);
      if (!resolved || resolved === member.displayName) return;
      member.displayName = resolved;
      await member.save();
    }),
  );
  const storedNames = new Map(
    members.flatMap((member) => {
      const resolved = personLabel(member.displayName);
      return resolved ? [[member.kindeUserId, resolved] as const] : [];
    }),
  );
  const inclusionByOwner = new Map(
    settingsList.map((settings) => [
      settings.kindeUserId,
      settings.personalInclusion,
    ]),
  );
  const viewerName = personLabel(displayName) || storedNames.get(kindeUserId);
  const unnamedIds = ownerIds.filter(
    (ownerId) =>
      ownerLabel(ownerId, kindeUserId, viewerName, storedNames) ===
      pl.finance.household.otherPerson,
  );
  if (unnamedIds.length === 1) {
    const [unnamedId] = unnamedIds;
    const parents = await User.find().select("name").lean();
    const knownNames = ownerIds
      .filter((ownerId) => ownerId !== unnamedId)
      .map((ownerId) =>
        ownerLabel(ownerId, kindeUserId, viewerName, storedNames),
      );
    const parentName = soleRemainingName(knownNames, parents.map((parent) => parent.name));
    if (parentName) {
      storedNames.set(unnamedId, parentName);
      await rememberMember(unnamedId, parentName);
    }
  }

  const [lineCategories, personalCategories] = await Promise.all([
    categoriesForLines(lines),
    categoryService.loadCategoriesByIds(
      personalExpenses.flatMap((item) => {
        const categoryId = readStoredCategory(item.categoryId).categoryId;
        return categoryId ? [categoryId] : [];
      }),
    ),
  ]);

  const personalOwners: HouseholdPersonalOwner[] = ownerIds
    .map((ownerId) => ({
      ownerId,
      label: ownerLabel(ownerId, kindeUserId, viewerName, storedNames),
      personalInclusion: inclusionByOwner.get(ownerId) ?? DEFAULT_INCLUSION,
      items: personalExpenses
        .filter((item) => item.kindeUserId === ownerId)
        .map((item) => {
          const stored = readStoredCategory(item.categoryId);
          const category =
            stored.category ??
            (stored.categoryId
              ? personalCategories.get(stored.categoryId)
              : undefined);
          return {
            id: item._id.toString(),
            title: item.title,
            amount: item.amount,
            ...(category
              ? {
                  categoryName: category.name,
                  categoryIcon: category.icon,
                  categoryColor: category.color,
                }
              : {}),
          };
        }),
    }))
    .sort((left, right) => {
      if (left.ownerId === kindeUserId) return -1;
      if (right.ownerId === kindeUserId) return 1;
      return left.label.localeCompare(right.label, "pl");
    });

  const dtos = lines.map((line) => toLineDto(line, lineCategories));

  return buildHouseholdPlanView({
    year: planYear,
    month: planMonth,
    personalInclusion: inclusionByOwner.get(kindeUserId) ?? DEFAULT_INCLUSION,
    incomes: dtos.filter((line) => line.kind === "income"),
    expenses: dtos.filter((line) => line.kind === "expense"),
    personalOwners,
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
    ...sharedMonthFilter(parsed.data.year, parsed.data.month),
    kind: parsed.data.kind,
  })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean()
    .exec();

  const categoryId = await categoryForExpenseLine(
    parsed.data.kind,
    parsed.data.categoryId,
  );

  const line = await HouseholdPlanLine.create({
    householdId: DEFAULT_HOUSEHOLD_ID,
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
    kind: parsed.data.kind,
    title: parsed.data.title,
    amount: parsed.data.amount,
    notes: parsed.data.notes,
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    ...(categoryId ? { categoryId } : {}),
  });

  const categories = await categoriesForLines([line]);
  return toLineDto(line, categories);
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

  const line = await getSharedLine(id);
  if (!line.householdId) line.householdId = DEFAULT_HOUSEHOLD_ID;
  if (parsed.data.title !== undefined) line.title = parsed.data.title;
  if (parsed.data.amount !== undefined) line.amount = parsed.data.amount;
  if (parsed.data.notes !== undefined) {
    line.notes = parsed.data.notes ?? undefined;
  }
  if (line.kind === "expense" && parsed.data.categoryId !== undefined) {
    const categoryId = await categoryForExpenseLine(
      "expense",
      parsed.data.categoryId,
    );
    line.set("categoryId", categoryId ?? undefined);
  }
  await line.save();
  const categories = await categoriesForLines([line]);
  return toLineDto(line, categories);
}

export async function deleteHouseholdLine(
  kindeUserId: string,
  id: string,
): Promise<void> {
  const line = await getSharedLine(id);
  await line.deleteOne();
}

export async function updateHouseholdSettings(
  kindeUserId: string,
  input: UpdateHouseholdSettingsInput,
  displayName?: string,
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

  return getHouseholdPlan(
    kindeUserId,
    parsed.data.year,
    parsed.data.month,
    displayName,
  );
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

  const currentCount = await HouseholdPlanLine.countDocuments(
    sharedMonthFilter(parsed.data.year, parsed.data.month),
  ).exec();

  if (currentCount > 0) {
    throw new ConflictError(pl.finance.household.errors.targetNotEmpty);
  }

  const previous = getPreviousMonth(parsed.data.year, parsed.data.month);
  const [sourceLines, sourceSettings] = await Promise.all([
    HouseholdPlanLine.find(
      sharedMonthFilter(previous.year, previous.month),
    )
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
    sourceLines.map((line) => {
      const categoryId =
        line.kind === "expense" ? categoryObjectId(line.categoryId) : undefined;
      return {
        householdId: DEFAULT_HOUSEHOLD_ID,
        kindeUserId,
        year: parsed.data.year,
        month: parsed.data.month,
        kind: line.kind,
        title: line.title,
        amount: line.amount,
        notes: line.notes,
        sortOrder: line.sortOrder,
        ...(categoryId ? { categoryId } : {}),
      };
    }),
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
