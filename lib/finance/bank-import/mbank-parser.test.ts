import iconv from "iconv-lite";
import { describe, expect, it } from "vitest";

import { ValidationError } from "@/utils/errors";

import {
  cleanMerchantTitle,
  decodeMbankCsvBuffer,
  parseMbankCsv,
  parseMbankCsvBuffer,
} from "./mbank-parser";

const SAMPLE_CSV = `mBank S.A.
#Data księgowania;Data operacji;Opis operacji;Tytuł;Nadawca;Odbiorca;Konto;Kwota;Saldo
"2025-05-10";"2025-05-09";"Zakup towarów i usług";"LIDL /MIASTO DATA TRANSAKCJI: 2025-05-09";" ";"";"123";"-50,00";"1000,00"
"2025-05-10";"2025-05-09";"Wpływ";"Wynagrodzenie";" ";"";"123";"5000,00";"6000,00"
"2025-05-11";"2025-05-10";"Opłata";"USŁUGA TEST";" ";"";"123";"-30,00";"2500,00"
"2025-04-10";"2025-04-09";"Zakup";"BIEDRONKA";" ";"";"123";"-20,00";"500,00"
#Saldo końcowe
`;

describe("mbank-parser", () => {
  it("cleans merchant titles", () => {
    expect(
      cleanMerchantTitle("LIDL /MIASTO DATA TRANSAKCJI: 2025-05-09"),
    ).toBe("LIDL");
  });

  it("parses debit and credit rows from sample CSV", () => {
    const { transactions } = parseMbankCsv(SAMPLE_CSV);

    expect(transactions).toHaveLength(4);

    const lidl = transactions[0];
    expect(lidl.amount).toBe(-50);
    expect(lidl.cleanTitle).toBe("LIDL");
    expect(lidl.operationDate.toISOString()).toBe("2025-05-09T00:00:00.000Z");

    const credit = transactions[1];
    expect(credit.amount).toBe(5000);

    const debits = transactions.filter((tx) => tx.amount < 0);
    expect(debits).toHaveLength(3);
  });

  it("parses CSV from buffer", () => {
    const { transactions } = parseMbankCsvBuffer(Buffer.from(SAMPLE_CSV, "utf8"));
    expect(transactions.length).toBeGreaterThan(0);
  });

  it("parses 8-column mBank rows with a trailing semicolon", () => {
    const csv = `mBank S.A.
#Data księgowania;#Data operacji;Opis;Tytuł;Nadawca/Odbiorca;Numer konta;Kwota;Saldo;
2025-05-01;2025-05-01;BLIK;"SKLEP TEST";"  ";'';-50,00;1500,00;
`;
    const { transactions } = parseMbankCsv(csv);
    expect(transactions[0].amount).toBe(-50);
    expect(transactions[0].balance).toBe(1500);
  });

  it("decodes Windows-1250 exports when UTF-8 would corrupt the header", () => {
    const win1250Csv = `mBank S.A.
#Data księgowania;#Data operacji;Opis operacji;Tytuł;Nadawca;Numer konta;Kwota;Saldo
2025-05-01;2025-05-01;BLIK;"SKLEP TEST";"  ";'';-10,00;100,00
`;
    const buffer = iconv.encode(win1250Csv, "win1250");
    const decoded = decodeMbankCsvBuffer(buffer);
    expect(decoded).toContain("#Data księgowania");

    const { transactions } = parseMbankCsvBuffer(buffer);
    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(-10);
  });

  it("throws for unsupported format", () => {
    expect(() => parseMbankCsv("not,a,bank,csv")).toThrow(ValidationError);
  });
});
