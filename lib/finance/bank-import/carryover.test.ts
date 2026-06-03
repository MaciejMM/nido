import { describe, expect, it } from "vitest";

import type { ParsedBankTransaction } from "@/lib/finance/bank-import/mbank-parser";

import {
  findLastPaycheckInMonth,
  getCarryoverDebitsFromPreviousMonth,
  isDebitAfterPaycheck,
} from "./carryover";

function tx(
  date: string,
  amount: number,
  title = "Test",
): ParsedBankTransaction {
  const operationDate = new Date(`${date}T00:00:00.000Z`);
  return {
    bookingDate: operationDate,
    operationDate,
    operationDescription: amount > 0 ? "Wpływ" : "Zakup",
    title,
    cleanTitle: title,
    sender: "",
    account: "123",
    amount,
    balance: null,
  };
}

describe("carryover", () => {
  it("finds the last paycheck deposit in a month", () => {
    const transactions = [
      tx("2025-04-05", 3000),
      tx("2025-04-28", 5000, "Wynagrodzenie"),
      tx("2025-04-29", 5200),
    ];

    const anchor = findLastPaycheckInMonth(transactions, 2025, 4);
    expect(anchor?.operationDate.toISOString()).toBe(
      new Date("2025-04-29T00:00:00.000Z").toISOString(),
    );
    expect(anchor?.transactionIndex).toBe(2);
  });

  it("returns debits in previous month after the last paycheck for target month", () => {
    const transactions = [
      tx("2025-04-20", -30, "BIEDRONKA"),
      tx("2025-04-28", 5000, "Wynagrodzenie"),
      tx("2025-04-29", -50, "LIDL"),
      tx("2025-04-30", -20, "ŻABKA"),
      tx("2025-05-02", -40, "KAUFLAND"),
    ];

    const carryover = getCarryoverDebitsFromPreviousMonth(transactions, 2025, 5);
    expect(carryover.map((t) => t.cleanTitle)).toEqual(["LIDL", "ŻABKA"]);
  });

  it("includes same-day debits only after paycheck row in CSV order", () => {
    const anchor = {
      operationDate: new Date("2025-04-28T00:00:00.000Z"),
      transactionIndex: 1,
    };
    const before = tx("2025-04-28", -10, "RANO");
    const after = tx("2025-04-28", -20, "WIECZOR");

    expect(isDebitAfterPaycheck(before, 0, anchor)).toBe(false);
    expect(isDebitAfterPaycheck(after, 2, anchor)).toBe(true);
  });
});
