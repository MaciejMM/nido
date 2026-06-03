import { describe, expect, it } from "vitest";

import { parseMbankCsvBuffer } from "@/lib/finance/bank-import/mbank-parser";

import { resolveClosingBalanceFromTransactions } from "./account-balance.service";

const SAMPLE_CSV = `mBank S.A.
#Data księgowania;Data operacji;Opis operacji;Tytuł;Nadawca;Odbiorca;Konto;Kwota;Saldo
"2025-05-10";"2025-05-09";"Zakup";"SKLEP TEST";" ";"";"123";"-50,00";"1000,00"
"2025-05-10";"2025-05-09";"Wpływ";"Wynagrodzenie";" ";"";"123";"5000,00";"6000,00"
"2025-05-11";"2025-05-10";"Zakup";"INNE";" ";"";"123";"-30,00";"2500,00"
`;

describe("account-balance.service", () => {
  it("reads closing balance from last transaction in sample CSV", () => {
    const parsed = parseMbankCsvBuffer(Buffer.from(SAMPLE_CSV, "utf8"));
    const closing = resolveClosingBalanceFromTransactions(parsed.transactions);

    expect(closing?.balance).toBe(2500);
    expect(closing?.asOf.toISOString()).toBe(
      new Date("2025-05-10T00:00:00.000Z").toISOString(),
    );
  });
});
