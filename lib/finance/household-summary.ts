import { DEFAULT_CURRENCY } from "@/lib/finance/constants";
import type {
  HouseholdLineDto,
  HouseholdPersonalGroup,
  HouseholdPersonalLine,
  HouseholdPlanDto,
  HouseholdPlanSummary,
  PersonalInclusionMode,
} from "@/types";

export interface HouseholdPersonalSource {
  id: string;
  title: string;
  amount: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
}

export interface HouseholdPersonalOwner {
  ownerId: string;
  label: string;
  personalInclusion: PersonalInclusionMode;
  items: HouseholdPersonalSource[];
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
  personalOwners: HouseholdPersonalOwner[];
  currency?: string;
}): HouseholdPlanDto {
  const currency = input.currency ?? DEFAULT_CURRENCY;
  const totalIncome = sumAmounts(input.incomes);
  const householdExpenses = sumAmounts(input.expenses);
  const personalGroups = groupsForOwners(input.personalOwners);
  const personalExpenses = personalGroups.reduce(
    (total, group) => total + group.total,
    0,
  );
  const totalCosts = householdExpenses + personalExpenses;
  const personalLines = personalGroups.flatMap((group) =>
    group.lines.map((line) =>
      line.source === "consolidated" ? { ...line, title: group.label } : line,
    ),
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
    personalCount: input.personalOwners.reduce(
      (count, owner) => count + owner.items.length,
      0,
    ),
  };

  return {
    year: input.year,
    month: input.month,
    personalInclusion: input.personalInclusion,
    incomes: input.incomes,
    expenses: input.expenses,
    personalGroups,
    personalLines,
    summary,
  };
}

function groupsForOwners(
  owners: HouseholdPersonalOwner[],
): HouseholdPersonalGroup[] {
  return owners.flatMap((owner) => {
    const personalTotal = sumAmounts(owner.items);
    const lines = personalLinesForMode(
      owner.personalInclusion,
      owner.items,
      personalTotal,
    ).map((line) =>
      line.source === "consolidated"
        ? { ...line, id: `personal-${owner.ownerId}`, title: owner.label }
        : line,
    );

    if (lines.length === 0) return [];

    return [
      {
        id: owner.ownerId,
        label: owner.label,
        lines,
        total: personalTotal,
      },
    ];
  });
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
    ...(item.categoryName
      ? {
          categoryName: item.categoryName,
          categoryIcon: item.categoryIcon,
          categoryColor: item.categoryColor,
        }
      : {}),
  }));
}
