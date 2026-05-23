import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import {
  budgetQuerySchema,
  upsertBudgetSchema,
} from "@/lib/validators/finance/budget";
import { pl } from "@/lib/i18n";
import { MonthlyBudget } from "@/models/MonthlyBudget";
import type { MonthlyBudgetDto, UpsertBudgetInput } from "@/types";
import { ValidationError } from "@/utils/errors";

function resolveYearMonth(
  year?: number,
  month?: number,
): { year: number; month: number } {
  const now = new Date();
  return {
    year: year ?? now.getFullYear(),
    month: month ?? now.getMonth() + 1,
  };
}

export function toBudgetDto(budget: {
  _id: { toString(): string };
  year: number;
  month: number;
  limitAmount: number;
}): MonthlyBudgetDto {
  return {
    id: budget._id.toString(),
    year: budget.year,
    month: budget.month,
    limitAmount: budget.limitAmount,
  };
}

export async function getBudget(
  year?: number,
  month?: number,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<MonthlyBudgetDto | null> {
  const parsed = budgetQuerySchema.safeParse({ year, month });
  if (!parsed.success) {
    throw new ValidationError(pl.common.invalidQuery, parsed.error.flatten());
  }

  const resolved = resolveYearMonth(parsed.data.year, parsed.data.month);
  const budget = await MonthlyBudget.findOne({
    householdId,
    year: resolved.year,
    month: resolved.month,
  }).exec();

  return budget ? toBudgetDto(budget) : null;
}

export async function upsertBudget(
  input: UpsertBudgetInput,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<MonthlyBudgetDto> {
  const parsed = upsertBudgetSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      pl.finance.errors.invalidBudget,
      parsed.error.flatten(),
    );
  }

  const budget = await MonthlyBudget.findOneAndUpdate(
    {
      householdId,
      year: parsed.data.year,
      month: parsed.data.month,
    },
    { limitAmount: parsed.data.limitAmount },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  return toBudgetDto(budget!);
}
