import { beforeEach, describe, expect, it, vi } from "vitest";

const { expenseCreateMock, listCategoriesMock } = vi.hoisted(() => ({
  expenseCreateMock: vi.fn(),
  listCategoriesMock: vi.fn(),
}));

vi.mock("@/models/Expense", () => ({
  Expense: {
    create: expenseCreateMock,
  },
}));

vi.mock("./category.service", () => ({
  listCategories: listCategoriesMock,
}));

import { importExpensesFromMbankCsv } from "./expense-import.service";

const SAMPLE_CSV = `mBank S.A.
#Data księgowania;Data operacji;Opis operacji;Tytuł;Nadawca;Odbiorca;Konto;Kwota;Saldo
"2025-05-10";"2025-05-09";"Zakup";"LIDL /POZNAN";" ";"";"123";"-50,00";"1000,00"
"2025-05-10";"2025-05-09";"Wpływ";"Wynagrodzenie";" ";"";"123";"5000,00";"6000,00"
"2025-04-10";"2025-04-09";"Zakup";"BIEDRONKA";" ";"";"123";"-20,00";"500,00"
"2025-05-11";"2025-05-10";"Zakup";"LIDL /POZNAN";" ";"";"123";"-50,00";"950,00"
`;

const categories = [
  {
    id: "507f1f77bcf86cd799439011",
    name: "Jedzenie",
    icon: "UtensilsCrossed",
    color: "var(--chart-1)",
    monthlyLimit: null,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "507f1f77bcf86cd799439012",
    name: "Inne",
    icon: "MoreHorizontal",
    color: "var(--chart-2)",
    monthlyLimit: null,
    isDefault: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

describe("expense-import.service", () => {
  beforeEach(() => {
    expenseCreateMock.mockReset();
    listCategoriesMock.mockReset();
    listCategoriesMock.mockResolvedValue(categories);
  });

  it("imports debits in selected month and skips credits and other months", async () => {
    expenseCreateMock.mockResolvedValue({});

    const result = await importExpensesFromMbankCsv({
      csvBuffer: Buffer.from(SAMPLE_CSV, "utf8"),
      year: 2025,
      month: 5,
    });

    expect(result.imported).toBe(2);
    expect(result.outOfMonthSkipped).toBe(1);
    expect(expenseCreateMock).toHaveBeenCalledTimes(2);

    const firstCall = expenseCreateMock.mock.calls[0]?.[0];
    expect(firstCall.amount).toBe(50);
    expect(firstCall.title).toBe("LIDL");
    expect(firstCall.importSource).toBe("mbank_csv");
    expect(firstCall.importHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("counts duplicate key errors as duplicatesSkipped", async () => {
    expenseCreateMock
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({ code: 11000 })
      .mockResolvedValueOnce({});

    const result = await importExpensesFromMbankCsv({
      csvBuffer: Buffer.from(SAMPLE_CSV, "utf8"),
      year: 2025,
      month: 5,
    });

    expect(result.imported).toBe(1);
    expect(result.duplicatesSkipped).toBe(1);
  });
});
