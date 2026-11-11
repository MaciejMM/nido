import { DEFAULT_CURRENCY } from "@/lib/finance/constants";
import type {
  HouseholdLineDto,
  HouseholdPersonalLine,
  HouseholdPlanDto,
  HouseholdPlanSummary,
  PersonalInclusionMode,
} from "@/types";

export interface HouseholdPersonalSource {
  id: string;
  title: string;
  amount: number;
}

function sumAmounts(items: { amount: number }[]): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function buildHouseholdPlanView(input: {
  year: number;
  month: number;
  personalInclusion: PersonalInclusionMode;
  incomes: HouseholdLineDto[];
  expenses: HouseholdLineDto[];
  personalItems: HouseholdPersonalSource[];
  currency?: string;
}): HouseholdPlanDto {
  const currency = input.currency ?? DEFAULT_CURRENCY;
  const totalIncome = sumAmounts(input.incomes);
  const householdExpenses = sumAmounts(input.expenses);
  const personalTotal = sumAmounts(input.personalItems);
  const includePersonal = input.personalInclusion !== "none";
  const personalExpenses = includePersonal ? personalTotal : 0;
  const totalCosts = householdExpenses + personalExpenses;

  const personalLines = personalLinesForMode(
    input.personalInclusion,
    input.personalItems,
    personalTotal,
  );

  const summary: HouseholdPlanSummary = {
    totalIncome,
    householdExpenses,
    personalExpenses,
    totalCosts,
    savings: totalIncome - totalCosts,
    currency,
    incomeCount: input.incomes.length,
    expenseCount: input.expenses.length,
    personalCount: input.personalItems.length,
  };

  return {
    year: input.year,
    month: input.month,
    personalInclusion: input.personalInclusion,
    incomes: input.incomes,
    expenses: input.expenses,
    personalLines,
    summary,
  };
}

function personalLinesForMode(
  mode: PersonalInclusionMode,
  items: HouseholdPersonalSource[],
  personalTotal: number,
): HouseholdPersonalLine[] {
  if (mode === "none" || items.length === 0) return [];

  if (mode === "consolidated") {
    return [
      {
        id: "personal-consolidated",
        title: "",
        amount: personalTotal,
        source: "consolidated",
      },
    ];
  }

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    amount: item.amount,
    source: "personal" as const,
  }));
}
