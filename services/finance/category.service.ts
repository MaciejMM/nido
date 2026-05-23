import { Types } from "mongoose";

import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance/default-categories";
import {
  createCategorySchema,
  updateCategorySchema,
} from "@/lib/validators/finance/category";
import { pl } from "@/lib/i18n";
import { Expense } from "@/models/Expense";
import {
  ExpenseCategory,
  type IExpenseCategory,
} from "@/models/ExpenseCategory";
import type {
  CreateCategoryInput,
  ExpenseCategoryDto,
  UpdateCategoryInput,
} from "@/types";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";

export function toCategoryDto(category: IExpenseCategory): ExpenseCategoryDto {
  return {
    id: category._id.toString(),
    name: category.name,
    icon: category.icon,
    color: category.color,
    monthlyLimit: category.monthlyLimit ?? null,
    isDefault: category.isDefault,
    createdAt: category.createdAt.toISOString(),
  };
}

export async function seedDefaultCategories(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  const existing = await ExpenseCategory.countDocuments({
    householdId,
    isDefault: true,
  }).exec();

  if (existing > 0) return;

  await ExpenseCategory.insertMany(
    DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      householdId,
      isDefault: true,
    })),
  );
}

export async function listCategories(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseCategoryDto[]> {
  await seedDefaultCategories(householdId);
  const categories = await ExpenseCategory.find({ householdId })
    .sort({ isDefault: -1, name: 1 })
    .exec();
  return categories.map(toCategoryDto);
}

export async function createCategory(
  input: CreateCategoryInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseCategoryDto> {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidCategory,
      parsed.error.flatten(),
    );
  }

  const duplicate = await ExpenseCategory.findOne({
    householdId,
    name: parsed.data.name,
  }).exec();

  if (duplicate) {
    throw new ConflictError(pl.finance.errors.categoryExists);
  }

  const category = await ExpenseCategory.create({
    name: parsed.data.name,
    icon: parsed.data.icon,
    color: parsed.data.color,
    monthlyLimit: parsed.data.monthlyLimit ?? null,
    householdId,
    isDefault: false,
  });

  return toCategoryDto(category);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseCategoryDto> {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidCategory,
      parsed.error.flatten(),
    );
  }

  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundError(pl.finance.errors.categoryNotFound);
  }

  if (parsed.data.monthlyLimit === undefined) {
    throw new ValidationError(pl.finance.errors.invalidCategory, {
      monthlyLimit: ["Required"],
    });
  }

  const category = await ExpenseCategory.findOneAndUpdate(
    { _id: id, householdId },
    { $set: { monthlyLimit: parsed.data.monthlyLimit } },
    { returnDocument: "after", runValidators: true },
  ).exec();

  if (!category) {
    throw new NotFoundError(pl.finance.errors.categoryNotFound);
  }

  return toCategoryDto(category);
}

export async function getCategoryById(
  id: string,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<ExpenseCategoryDto | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  const category = await ExpenseCategory.findOne({
    _id: id,
    householdId,
  }).exec();
  return category ? toCategoryDto(category) : null;
}

export async function deleteCategory(
  id: string,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundError(pl.finance.errors.categoryNotFound);
  }

  const category = await ExpenseCategory.findOne({
    _id: id,
    householdId,
  }).exec();

  if (!category) {
    throw new NotFoundError(pl.finance.errors.categoryNotFound);
  }

  const expenseCount = await Expense.countDocuments({
    householdId,
    categoryId: category._id,
  }).exec();

  if (expenseCount > 0) {
    throw new ConflictError(pl.finance.errors.categoryHasExpenses);
  }

  await ExpenseCategory.findByIdAndDelete(category._id).exec();
}
