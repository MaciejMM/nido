import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIN_PAYCHECK_AMOUNT_PLN } from "@/lib/finance/constants";
import { isPaycheckDeposit } from "@/lib/finance/bank-import/carryover";
import { parseMbankCsvBuffer } from "@/lib/finance/bank-import/mbank-parser";

const { paycheckFindOneMock, expenseAggregateMock } = vi.hoisted(() => ({
  paycheckFindOneMock: vi.fn(),
  expenseAggregateMock: vi.fn(),
}));

vi.mock("@/models/PaycheckAnchor", () => ({
  PaycheckAnchor: {
    findOne: paycheckFindOneMock,
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("@/models/Expense", () => ({
  Expense: {
    aggregate: expenseAggregateMock,
  },
}));

import {
  computePaycheckCycleMetrics,
  getSpentSincePaycheck,
  resolveExpenseMatchForMonth,
} from "./paycheck.service";

const SAMPLE_PAYCHECK_CSV = `mBank S.A.
#Data księgowania;Data operacji;Opis operacji;Tytuł;Nadawca;Odbiorca;Konto;Kwota;Saldo
"2025-04-28";"2025-04-28";"Wpływ";"Wynagrodzenie";" ";"";"123";"5000,00";"6000,00"
"2025-05-10";"2025-05-09";"Zakup";"SKLEP TEST";" ";"";"123";"-50,00";"5950,00"
`;

const ANCHOR_DATE = new Date("2025-04-28T00:00:00.000Z");
const PERIOD_END = new Date("2025-05-15T12:00:00.000Z");
const MOCK_SPENT = 1200;

describe("paycheck.service", () => {
  beforeEach(() => {
    paycheckFindOneMock.mockReset();
    expenseAggregateMock.mockReset();
  });

  it("detects paycheck deposits at or above minimum threshold in CSV", () => {
    const parsed = parseMbankCsvBuffer(Buffer.from(SAMPLE_PAYCHECK_CSV, "utf8"));
    const paychecks = parsed.transactions.filter(isPaycheckDeposit);

    expect(paychecks.length).toBeGreaterThanOrEqual(1);
    expect(paychecks[0]?.amount).toBe(MIN_PAYCHECK_AMOUNT_PLN);
    expect(paychecks[0]?.operationDate.toISOString()).toBe(ANCHOR_DATE.toISOString());
  });

  it("sums expenses from anchor date through period end", async () => {
    paycheckFindOneMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          operationDate: ANCHOR_DATE,
          amount: MIN_PAYCHECK_AMOUNT_PLN,
          title: "Wynagrodzenie",
        }),
      }),
    });

    expenseAggregateMock.mockReturnValue({
      exec: vi.fn().mockResolvedValue([{ total: MOCK_SPENT }]),
    });

    const result = await getSpentSincePaycheck(
      2025,
      5,
      "default",
      PERIOD_END,
    );

    expect(result?.spent).toBe(MOCK_SPENT);
    expect(result?.anchor.amount).toBe(MIN_PAYCHECK_AMOUNT_PLN);

    const matchStage = expenseAggregateMock.mock.calls[0]?.[0]?.[0]?.$match;
    expect(matchStage.date.$gte).toEqual(ANCHOR_DATE);
  });

  it("uses paycheck date range for analytics month match when anchor exists", async () => {
    paycheckFindOneMock.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          operationDate: ANCHOR_DATE,
          amount: MIN_PAYCHECK_AMOUNT_PLN,
          title: "Wynagrodzenie",
        }),
      }),
    });

    const match = await resolveExpenseMatchForMonth(
      2025,
      5,
      "default",
      PERIOD_END,
    );

    expect(match).toEqual({
      date: {
        $gte: ANCHOR_DATE,
        $lte: expect.any(Date),
      },
    });
  });

  it("computes remaining and utilization from paycheck anchor", () => {
    const metrics = computePaycheckCycleMetrics(
      {
        anchor: {
          operationDate: ANCHOR_DATE.toISOString(),
          amount: MIN_PAYCHECK_AMOUNT_PLN,
          title: "Wynagrodzenie",
        },
        spent: MOCK_SPENT,
        periodEnd: "2025-05-15T23:59:59.999Z",
      },
      MIN_PAYCHECK_AMOUNT_PLN,
      28,
      PERIOD_END,
    );

    expect(metrics.spent).toBe(MOCK_SPENT);
    expect(metrics.remaining).toBe(MIN_PAYCHECK_AMOUNT_PLN - MOCK_SPENT);
    expect(metrics.daysElapsed).toBe(18);
    expect(metrics.utilizationPercent).toBe(24);
  });
});
