import { describe, expect, it } from "vitest";

import type { HouseholdLineDto } from "@/types";
import type { HouseholdPersonalSource } from "./household-summary";

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

function owner(
  ownerId: string,
  label: string,
  personalInclusion: "all" | "consolidated" | "none",
  items: HouseholdPersonalSource[],
) {
  return { ownerId, label, personalInclusion, items };
}

describe("buildHouseholdPlanView", () => {
  it("keeps each private expense when inclusion is all", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "all",
      incomes,
      expenses,
      personalOwners: [owner("maciej", "Maciej", "all", personal)],
    });

    expect(view.personalGroups).toEqual([
      {
        id: "maciej",
        label: "Maciej",
        total: 550,
        lines: [
          { id: "p1", title: "Siłownia", amount: 150, source: "personal" },
          { id: "p2", title: "Lunch", amount: 400, source: "personal" },
        ],
      },
    ]);
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
      personalOwners: [owner("maciej", "Maciej", "consolidated", personal)],
    });

    expect(view.personalGroups).toEqual([
      {
        id: "maciej",
        label: "Maciej",
        total: 550,
        lines: [
          {
            id: "personal-maciej",
            title: "Maciej",
            amount: 550,
            source: "consolidated",
          },
        ],
      },
    ]);
    expect(view.personalLines).toEqual([
      {
        id: "personal-maciej",
        title: "Maciej",
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
      personalOwners: [owner("maciej", "Maciej", "none", personal)],
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
      personalOwners: [],
    });

    expect(view.summary.savings).toBe(-2000);
  });

  it("keeps each person's private expenses as a separate position", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "consolidated",
      incomes,
      expenses,
      personalOwners: [
        owner("maciej", "Maciej", "consolidated", personal),
        owner("zuza", "Zuza", "all", [
          { id: "z1", title: "Siłownia", amount: 200 },
        ]),
      ],
    });

    expect(view.personalGroups.map((group) => group.label)).toEqual([
      "Maciej",
      "Zuza",
    ]);
    expect(view.summary.personalExpenses).toBe(750);
    expect(view.summary.totalCosts).toBe(4250);
    expect(view.summary.savings).toBe(9750);
  });

  it("keeps a category on individual private lines", () => {
    const view = buildHouseholdPlanView({
      year: 2026,
      month: 11,
      personalInclusion: "all",
      incomes,
      expenses,
      personalOwners: [
        owner("maciej", "Maciej", "all", [
          {
            id: "p1",
            title: "Siłownia",
            amount: 150,
            categoryName: "Zdrowie",
            categoryIcon: "Tag",
            categoryColor: "#16a34a",
          },
        ]),
      ],
    });

    expect(view.personalGroups[0]?.lines[0]).toMatchObject({
      title: "Siłownia",
      categoryName: "Zdrowie",
      categoryIcon: "Tag",
      categoryColor: "#16a34a",
    });
  });
});
