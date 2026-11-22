import { DEFAULT_CURRENCY } from "@/lib/finance/constants";
import { categoryObjectId, readStoredCategory } from "@/lib/finance/read-category";
import { pl } from "@/lib/i18n";
import {
  copyFromPreviousMonthSchema,
  createPersonalExpenseSchema,
  listPersonalExpensesQuerySchema,
  patchPersonalExpenseSchema,
  updatePersonalExpenseSchema,
} from "@/lib/validators/finance/personal-expense";
import {
  PersonalExpense,
  type IPersonalExpense,
} from "@/models/PersonalExpense";
import type {
  CopyFromPreviousMonthInput,
  CopyFromPreviousMonthResult,
  CreatePersonalExpenseInput,
  PatchPersonalExpenseInput,
  PersonalExpenseDto,
  PersonalExpenseListResponse,
  PersonalExpenseSummary,
  UpdatePersonalExpenseInput,
} from "@/types";
import { getPreviousMonth } from "@/utils/finance-dates";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";
import * as categoryService from "@/services/finance/category.service";

function toPersonalExpenseDto(
  expense: IPersonalExpense,
  categories?: Map<string, PersonalExpenseDto["category"]>,
): PersonalExpenseDto {
  const stored = readStoredCategory(expense.categoryId);
  const category =
    stored.category ??
    (stored.categoryId ? categories?.get(stored.categoryId) : undefined);

  return {
    id: expense._id.toString(),
    year: expense.year,
    month: expense.month,
    title: expense.title,
    amount: expense.amount,
    currency: expense.currency,
    isPaid: expense.isPaid,
    paidAt: expense.paidAt?.toISOString(),
    notes: expense.notes,
    sortOrder: expense.sortOrder,
    visibility: expense.visibility,
    ...(stored.categoryId ? { categoryId: stored.categoryId } : {}),
    ...(category ? { category } : {}),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

async function categoriesFor(
  expenses: IPersonalExpense[],
): Promise<Map<string, PersonalExpenseDto["category"]>> {
  return categoryService.loadCategoriesByIds(
    expenses.flatMap((expense) => {
      const categoryId = readStoredCategory(expense.categoryId).categoryId;
      return categoryId ? [categoryId] : [];
    }),
  );
}

async function assignCategory(
  expense: IPersonalExpense,
  categoryId: string | null,
): Promise<void> {
  if (!categoryId) {
    expense.set("categoryId", undefined);
    return;
  }

  expense.categoryId = await categoryService.requireCategoryObjectId(categoryId);
}

function buildSummary(
  items: PersonalExpenseDto[],
  currency = DEFAULT_CURRENCY,
): PersonalExpenseSummary {
  const paidItems = items.filter((item) => item.isPaid);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = paidItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    totalAmount,
    paidAmount,
    remainingAmount: totalAmount - paidAmount,
    paidCount: paidItems.length,
    unpaidCount: items.length - paidItems.length,
    currency,
  };
}

function sortItems(items: PersonalExpenseDto[]): PersonalExpenseDto[] {
  return [...items].sort((a, b) => {
    if (a.isPaid !== b.isPaid) {
      return a.isPaid ? 1 : -1;
    }
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

async function getOwnedExpense(
  id: string,
  kindeUserId: string,
): Promise<IPersonalExpense> {
  const expense = await PersonalExpense.findOne({ _id: id, kindeUserId }).exec();
  if (!expense) {
    throw new NotFoundError(pl.finance.personalExpenses.errors.notFound);
  }
  return expense;
}

export async function listPersonalExpenses(
  kindeUserId: string,
  year: number,
  month: number,
): Promise<PersonalExpenseListResponse> {
  const parsed = listPersonalExpensesQuerySchema.safeParse({ year, month });
  if (!parsed.success) {
    throw new ValidationError(
      pl.common.invalidQuery,
      parsed.error.flatten(),
    );
  }

  const expenses = await PersonalExpense.find({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
    visibility: "private",
  })
    .populate("categoryId")
    .sort({ sortOrder: 1, createdAt: 1 })
    .exec();

  const categories = await categoriesFor(expenses);
  const items = sortItems(
    expenses.map((expense) => toPersonalExpenseDto(expense, categories)),
  );
  const currency = items[0]?.currency ?? DEFAULT_CURRENCY;

  return {
    items,
    summary: buildSummary(items, currency),
  };
}

export async function createPersonalExpense(
  kindeUserId: string,
  input: CreatePersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const parsed = createPersonalExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.personalExpenses.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const maxSort = await PersonalExpense.findOne({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
  })
    .sort({ sortOrder: -1 })
    .select("sortOrder")
    .lean()
    .exec();

  const expense = await PersonalExpense.create({
    kindeUserId,
    year: parsed.data.year,
    month: parsed.data.month,
    title: parsed.data.title,
    amount: parsed.data.amount,
    currency: DEFAULT_CURRENCY,
    notes: parsed.data.notes,
    visibility: parsed.data.visibility ?? "private",
    sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    ...(parsed.data.categoryId
      ? {
          categoryId: await categoryService.requireCategoryObjectId(
            parsed.data.categoryId,
          ),
        }
      : {}),
  });

  const categories = await categoriesFor([expense]);
  return toPersonalExpenseDto(expense, categories);
}

export async function updatePersonalExpense(
  kindeUserId: string,
  id: string,
  input: UpdatePersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const parsed = updatePersonalExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.personalExpenses.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const expense = await getOwnedExpense(id, kindeUserId);

  if (parsed.data.title !== undefined) expense.title = parsed.data.title;
  if (parsed.data.amount !== undefined) expense.amount = parsed.data.amount;
  if (parsed.data.notes !== undefined) {
    expense.notes = parsed.data.notes ?? undefined;
  }
  if (parsed.data.visibility !== undefined) {
    expense.visibility = parsed.data.visibility;
  }
  if (parsed.data.categoryId !== undefined) {
    await assignCategory(expense, parsed.data.categoryId);
  }

  await expense.save();
  const categories = await categoriesFor([expense]);
  return toPersonalExpenseDto(expense, categories);
}

export async function patchPersonalExpense(
  kindeUserId: string,
  id: string,
  input: PatchPersonalExpenseInput,
): Promise<PersonalExpenseDto> {
  const parsed = patchPersonalExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.personalExpenses.errors.invalid,
      parsed.error.flatten(),
    );
  }

  const expense = await getOwnedExpense(id, kindeUserId);

  if (parsed.data.isPaid !== undefined) {
    expense.isPaid = parsed.data.isPaid;
    expense.paidAt = parsed.data.isPaid ? new Date() : undefined;
  }
  if (parsed.data.title !== undefined) expense.title = parsed.data.title;
  if (parsed.data.amount !== undefined) expense.amount = parsed.data.amount;
  if (parsed.data.notes !== undefined) {
    expense.notes = parsed.data.notes ?? undefined;
  }

  await expense.save();
  const categories = await categoriesFor([expense]);
  return toPersonalExpenseDto(expense, categories);
}

export async function deletePersonalExpense(
  kindeUserId: string,
  id: string,
): Promise<void> {
  const result = await PersonalExpense.findOneAndDelete({
    _id: id,
    kindeUserId,
  }).exec();

  if (!result) {
    throw new NotFoundError(pl.finance.personalExpenses.errors.notFound);
  }
}

export async function copyFromPreviousMonth(
  kindeUserId: string,
  input: CopyFromPreviousMonthInput,
): Promise<CopyFromPreviousMonthResult> {
  const parsed = copyFromPreviousMonthSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.common.invalidQuery,
      parsed.error.flatten(),
    );
  }

  const { year, month } = parsed.data;

  const targetCount = await PersonalExpense.countDocuments({
    kindeUserId,
    year,
    month,
  }).exec();

  if (targetCount > 0) {
    throw new ConflictError(pl.finance.personalExpenses.errors.targetNotEmpty);
  }

  const { year: sourceYear, month: sourceMonth } = getPreviousMonth(year, month);

  const sourceItems = await PersonalExpense.find({
    kindeUserId,
    year: sourceYear,
    month: sourceMonth,
    visibility: "private",
  })
    .sort({ sortOrder: 1, createdAt: 1 })
    .exec();

  if (sourceItems.length === 0) {
    throw new ValidationError(pl.finance.personalExpenses.errors.sourceEmpty);
  }

  const { expenseIds } = parsed.data;
  const idSet = new Set(expenseIds);
  const itemsToCopy = sourceItems.filter((item) =>
    idSet.has(item._id.toString()),
  );

  if (itemsToCopy.length === 0) {
    throw new ValidationError(pl.finance.personalExpenses.errors.noneSelected);
  }

  if (itemsToCopy.length !== expenseIds.length) {
    throw new ValidationError(pl.finance.personalExpenses.errors.invalidSelection);
  }

  await PersonalExpense.insertMany(
    itemsToCopy.map((item, index) => {
      const categoryId = categoryObjectId(item.categoryId);
      return {
        kindeUserId,
        year,
        month,
        title: item.title,
        amount: item.amount,
        currency: item.currency,
        isPaid: false,
        paidAt: undefined,
        notes: item.notes,
        sortOrder: index,
        visibility: "private" as const,
        ...(categoryId ? { categoryId } : {}),
      };
    }),
  );

  return { copied: itemsToCopy.length };
}
