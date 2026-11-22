import { Types } from "mongoose";

import type { IExpenseCategory } from "@/models/ExpenseCategory";
import { toCategoryDto } from "@/services/finance/category.service";
import type { ExpenseCategoryDto } from "@/types";

export type CategoryRef = Types.ObjectId | IExpenseCategory | null | undefined;

function isObjectId(value: object): value is Types.ObjectId {
  return (
    value instanceof Types.ObjectId ||
    ("_bsontype" in value &&
      (value as { _bsontype?: string })._bsontype === "ObjectId")
  );
}

export function readStoredCategory(value: CategoryRef): {
  categoryId?: string;
  category?: ExpenseCategoryDto;
} {
  if (!value) return {};
  if (typeof value !== "object") return {};

  if (isObjectId(value)) {
    return { categoryId: value.toString() };
  }

  if ("name" in value && "_id" in value) {
    const category = toCategoryDto(value);
    return { categoryId: category.id, category };
  }

  return {};
}

export function categoryObjectId(value: CategoryRef): Types.ObjectId | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (isObjectId(value)) return value;
  if ("_id" in value && value._id && isObjectId(value._id)) {
    return value._id;
  }
  return undefined;
}
