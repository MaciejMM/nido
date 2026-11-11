import { describe, expect, it } from "vitest";

import type { HouseholdLineDto } from "@/types";

import { buildHouseholdPlanView } from "./household-summary";

function line(
  id: string,
  kind: "income" | "expense",
  title: string,
  amount: number,
): HouseholdLineDto {
  return {
    id,
    year: 2026,
    month: 11,
    kind,
    title,
    amount,
    sortOrder: 0,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

const incomes = [
  line("a", "income", "Wynagrodzenie A", 8000),
  line("b", "income", "Wynagrodzenie B", 6000),
];

const expenses = [
  line("c", "expense", "Czynsz", 3000),
  line("d", "expense", "Media", 500),
];

const personal = [
  { id: "p1", title: "Siłownia", amount: 150 },
  { id: "p2", title: "Lunch", amount: 400 },
];

describe("buildHouseholdPlanView", () => {
  it("keeps each private expense when inclusion is all", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "all",
      incomes,
      expenses,
      personalItems: personal,
    });

    expect(view.personalLines).toEqual([
      { id: "p1", title: "Siłownia", amount: 150, source: "personal" },
      { id: "p2", title: "Lunch", amount: 400, source: "personal" },
    ]);
    expect(view.summary).toMatchObject({
      totalIncome: 14000,
      householdExpenses: 3500,
      personalExpenses: 550,
      totalCosts: 4050,
      savings: 9950,
    });
  });

  it("rolls private expenses into one line", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "consolidated",
      incomes,
      expenses,
      personalItems: personal,
    });

    expect(view.personalLines).toEqual([
      {
        id: "personal-consolidated",
        title: "",
        amount: 550,
        source: "consolidated",
      },
    ]);
    expect(view.summary.savings).toBe(9950);
    expect(view.summary.personalCount).toBe(2);
  });

  it("excludes private expenses from savings when inclusion is none", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "none",
      incomes,
      expenses,
      personalItems: personal,
    });

    expect(view.personalLines).toEqual([]);
    expect(view.summary.personalExpenses).toBe(0);
    expect(view.summary.totalCosts).toBe(3500);
    expect(view.summary.savings).toBe(10500);
    expect(view.summary.personalCount).toBe(2);
  });

  it("reports a negative savings when costs exceed income", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "none",
      incomes: [line("a", "income", "Wynagrodzenie", 1000)],
      expenses: [line("c", "expense", "Czynsz", 3000)],
      personalItems: [],
    });

    expect(view.summary.savings).toBe(-2000);
  });
});
