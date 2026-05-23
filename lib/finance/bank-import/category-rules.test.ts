import { describe, expect, it } from "vitest";

import type { ExpenseCategoryDto } from "@/types";

import { resolveCategoryId, resolveCategoryName } from "./category-rules";

const categories: ExpenseCategoryDto[] = [
  {
    id: "1",
    name: "Jedzenie",
    icon: "UtensilsCrossed",
    color: "var(--chart-1)",
    monthlyLimit: null,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Rachunki",
    icon: "Receipt",
    color: "var(--chart-2)",
    monthlyLimit: null,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Inne",
    icon: "MoreHorizontal",
    color: "var(--chart-3)",
    monthlyLimit: null,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

describe("category-rules", () => {
  it("maps LIDL to Jedzenie", () => {
    expect(resolveCategoryName("LIDL", "Zakup towarów")).toBe("Jedzenie");
    expect(resolveCategoryId(categories, "Jedzenie")).toBe("1");
  });

  it("maps CANAL+ to Rachunki", () => {
    expect(resolveCategoryName("CANAL+ POLSKA", "Opłata")).toBe("Rachunki");
    expect(resolveCategoryId(categories, "Rachunki")).toBe("2");
  });

  it("falls back to Inne for unknown merchants", () => {
    expect(resolveCategoryName("VEMAT XYZ", "BLIK")).toBe("Inne");
    expect(resolveCategoryId(categories, "Inne")).toBe("3");
  });
});
