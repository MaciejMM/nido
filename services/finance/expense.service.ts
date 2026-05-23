import { Types } from "mongoose";

import { DEFAULT_CURRENCY, DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "@/lib/validators/finance/expense";
import { pl } from "@/lib/i18n";
import { Expense, type IExpense } from "@/models/Expense";
import type { IExpenseCategory } from "@/models/ExpenseCategory";
import type {
  CreateExpenseInput,
  ExpenseDto,
  ListExpensesFilters,
  UpdateExpenseInput,
} from "@/types";
import { getMonthDateRange } from "@/utils/finance-dates";
import { NotFoundError, ValidationError } from "@/utils/errors";

import * as categoryService from "./category.service";

function toExpenseDto(
  expense: IExpense,
  category?: IExpenseCategory,
): ExpenseDto {
  return {
    id: expense._id.toString(),
    amount: expense.amount,
    title: expense.title,
    categoryId: expense.categoryId.toString(),
    category: category ? categoryService.toCategoryDto(category) : undefined,
    date: expense.date.toISOString(),
    notes: expense.notes,
    currency: expense.currency,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

function buildListFilter(
  filters: ListExpensesFilters,
  householdId: string,
): Record<string, unknown> {
  const query: Record<string, unknown> = { householdId };

  if (filters.categoryId) {
    query.categoryId = new Types.ObjectId(filters.categoryId);
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (filters.dateFrom) dateFilter.$gte = filters.dateFrom;
    if (filters.dateTo) dateFilter.$lte = filters.dateTo;
    query.date = dateFilter;
  } else if (filters.year && filters.month) {
    const { start, end } = getMonthDateRange(filters.year, filters.month);
    query.date = { $gte: start, $lte: end };
  }

  return query;
}

export async function listExpenses(
  filters: ListExpensesFilters = {},
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseDto[]> {
  const parsed = listExpensesQuerySchema.safeParse(filters);
  if (!parsed.success) {
    throw new ValidationError(
      pl.common.invalidQuery,
      parsed.error.flatten(),
    );
  }

  const expenses = await Expense.find(buildListFilter(parsed.data, householdId))
    .populate<{ categoryId: IExpenseCategory }>("categoryId")
    .sort({ date: -1, createdAt: -1 })
    .exec();

  return expenses.map((expense) => {
    const category =
      expense.categoryId && typeof expense.categoryId === "object"
        ? (expense.categoryId as IExpenseCategory)
        : undefined;
    return toExpenseDto(expense as unknown as IExpense, category);
  });
}

export async function getExpenseById(
  id: string,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseDto> {
  const expense = await Expense.findOne({ _id: id, householdId })
    .populate<{ categoryId: IExpenseCategory }>("categoryId")
    .exec();

  if (!expense) {
    throw new NotFoundError(pl.finance.errors.expenseNotFound);
  }

  const category =
    expense.categoryId && typeof expense.categoryId === "object"
      ? (expense.categoryId as IExpenseCategory)
      : undefined;

  return toExpenseDto(expense as unknown as IExpense, category);
}

export async function createExpense(
  input: CreateExpenseInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseDto> {
  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidExpense,
      parsed.error.flatten(),
    );
  }

  const category = await categoryService.getCategoryById(
    parsed.data.categoryId,
    householdId,
  );
  if (!category) {
    throw new NotFoundError(pl.finance.errors.categoryNotFound);
  }

  const expense = await Expense.create({
    ...parsed.data,
    categoryId: new Types.ObjectId(parsed.data.categoryId),
    currency: DEFAULT_CURRENCY,
    householdId,
  });

  return getExpenseById(expense._id.toString(), householdId);
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseDto> {
  const parsed = updateExpenseSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidExpense,
      parsed.error.flatten(),
    );
  }

  const expense = await Expense.findOne({ _id: id, householdId }).exec();
  if (!expense) {
    throw new NotFoundError(pl.finance.errors.expenseNotFound);
  }

  if (parsed.data.categoryId) {
    const category = await categoryService.getCategoryById(
      parsed.data.categoryId,
      householdId,
    );
    if (!category) {
      throw new NotFoundError(pl.finance.errors.categoryNotFound);
    }
    expense.categoryId = new Types.ObjectId(parsed.data.categoryId);
  }

  if (parsed.data.amount !== undefined) expense.amount = parsed.data.amount;
  if (parsed.data.title !== undefined) expense.title = parsed.data.title;
  if (parsed.data.date !== undefined) expense.date = parsed.data.date;
  if (parsed.data.notes !== undefined) expense.notes = parsed.data.notes;

  await expense.save();
  return getExpenseById(id, householdId);
}

export async function deleteExpense(
  id: string,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  const result = await Expense.findOneAndDelete({ _id: id, householdId }).exec();
  if (!result) {
    throw new NotFoundError(pl.finance.errors.expenseNotFound);
  }
}

export async function sumExpensesInMonth(
  year: number,
  month: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<number> {
  const { start, end } = getMonthDateRange(year, month);
  const result = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        householdId,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).exec();

  return result[0]?.total ?? 0;
}
