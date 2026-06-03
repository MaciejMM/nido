import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateManyMock, deleteManyMock, getCategoryByIdMock } = vi.hoisted(
  () => ({
    updateManyMock: vi.fn(),
    deleteManyMock: vi.fn(),
    getCategoryByIdMock: vi.fn(),
  }),
);

vi.mock("@/models/Expense", () => ({
  Expense: {
    updateMany: updateManyMock,
    deleteMany: deleteManyMock,
  },
}));

vi.mock("./category.service", () => ({
  getCategoryById: getCategoryByIdMock,
}));

import {
  bulkDeleteExpenses,
  bulkUpdateExpenseCategory,
} from "./expense.service";

describe("expense.service bulkUpdateExpenseCategory", () => {
  beforeEach(() => {
    updateManyMock.mockReset();
    getCategoryByIdMock.mockReset();
  });

  it("updates expenses when category exists", async () => {
    const categoryId = "507f1f77bcf86cd799439011";
    getCategoryByIdMock.mockResolvedValue({
      id: categoryId,
      name: "Jedzenie",
    });
    updateManyMock.mockReturnValue({
      exec: vi.fn().mockResolvedValue({ modifiedCount: 3 }),
    });

    const result = await bulkUpdateExpenseCategory(
      ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
      categoryId,
    );

    expect(result).toEqual({ updated: 3 });
    expect(getCategoryByIdMock).toHaveBeenCalledWith(
      categoryId,
      expect.any(String),
    );
    expect(updateManyMock).toHaveBeenCalledOnce();
  });

  it("throws when category is missing", async () => {
    getCategoryByIdMock.mockResolvedValue(null);

    await expect(
      bulkUpdateExpenseCategory(["507f1f77bcf86cd799439012"], "missing"),
    ).rejects.toThrow();
    expect(updateManyMock).not.toHaveBeenCalled();
  });
});

describe("expense.service bulkDeleteExpenses", () => {
  beforeEach(() => {
    deleteManyMock.mockReset();
  });

  it("deletes expenses by ids", async () => {
    deleteManyMock.mockReturnValue({
      exec: vi.fn().mockResolvedValue({ deletedCount: 2 }),
    });

    const result = await bulkDeleteExpenses([
      "507f1f77bcf86cd799439012",
      "507f1f77bcf86cd799439013",
    ]);

    expect(result).toEqual({ deleted: 2 });
    expect(deleteManyMock).toHaveBeenCalledOnce();
  });
});
