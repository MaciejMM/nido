import iconv from "iconv-lite";

import { parseCalendarDate } from "@/utils/dates";
import { ValidationError } from "@/utils/errors";

export interface ParsedBankTransaction {
  bookingDate: Date;
  operationDate: Date;
  operationDescription: string;
  title: string;
  cleanTitle: string;
  sender: string;
  account: string;
  amount: number;
  balance: number | null;
}

const TRANSACTION_HEADER_MARKER = "#Data księgowania";
const FOOTER_MARKER = "#Saldo końcowe";

export function decodeMbankCsvBuffer(buffer: Buffer): string {
  const utf8 = buffer.toString("utf8");
  const win1250 = iconv.decode(buffer, "win1250");

  // Prefer the encoding that contains the transaction header (Polish diacritics).
  // mBank exports are often Windows-1250; mis-reading them as UTF-8 still matches
  // "mbank" / "#Data operacji" in ASCII but corrupts "księgowania".
  if (win1250.includes(TRANSACTION_HEADER_MARKER)) {
    return win1250;
  }
  if (utf8.includes(TRANSACTION_HEADER_MARKER)) {
    return utf8;
  }

  if (/mbank/i.test(win1250) || win1250.includes("#Data operacji")) {
    return win1250;
  }
  if (/mbank/i.test(utf8) || utf8.includes("#Data operacji")) {
    return utf8;
  }

  return win1250;
}

export function cleanMerchantTitle(rawTitle: string): string {
  let title = rawTitle.trim().replace(/^"|"$/g, "");

  const dataTransakcjiIdx = title.search(/\s*DATA TRANSAKCJI:/i);
  if (dataTransakcjiIdx >= 0) {
    title = title.slice(0, dataTransakcjiIdx).trim();
  }

  const slashIdx = title.indexOf("/");
  if (slashIdx >= 0) {
    title = title.slice(0, slashIdx).trim();
  }

  title = title.replace(/^WWW\./i, "");

  if (title.length > 200) {
    title = title.slice(0, 200);
  }

  return title || rawTitle.trim().slice(0, 200);
}

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ";" && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

function parsePolishAmount(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;

  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function parseMbankDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  try {
    return parseCalendarDate(trimmed);
  } catch {
    return null;
  }
}

function isMbankCsv(content: string): boolean {
  return (
    content.includes(TRANSACTION_HEADER_MARKER) ||
    content.includes("#Data operacji") ||
    /mbank/i.test(content)
  );
}

function findTransactionHeaderIndex(lines: string[]): number {
  return lines.findIndex((line) => line.includes(TRANSACTION_HEADER_MARKER));
}

function parseTransactionRow(
  line: string,
  lineNumber: number,
): ParsedBankTransaction | null {
  if (!line.trim() || line.startsWith(FOOTER_MARKER)) return null;

  let fields = parseCsvRow(line);
  if (fields.length < 7) {
    throw new ValidationError(
      `Nieprawidłowy wiersz CSV w linii ${lineNumber}`,
    );
  }

  // mBank rows often end with ';', yielding an empty trailing field.
  if (fields.length >= 9 && fields[fields.length - 1].trim() === "") {
    fields = fields.slice(0, -1);
  }

  const hasRecipientColumn = fields.length >= 9;
  const amountIndex = hasRecipientColumn ? 7 : 6;
  const balanceIndex = hasRecipientColumn ? 8 : 7;
  const accountIndex = hasRecipientColumn ? 6 : 5;

  const bookingDate = parseMbankDate(fields[0]);
  const operationDate = parseMbankDate(fields[1]);
  const amount = parsePolishAmount(fields[amountIndex]);

  if (!bookingDate || !operationDate || amount === null) {
    throw new ValidationError(
      `Nieprawidłowy wiersz CSV w linii ${lineNumber}`,
    );
  }

  const title = fields[3]?.trim() ?? "";
  const operationDescription = fields[2]?.trim() ?? "";

  return {
    bookingDate,
    operationDate,
    operationDescription,
    title,
    cleanTitle: cleanMerchantTitle(title),
    sender: fields[4]?.trim() ?? "",
    account: fields[accountIndex]?.trim() ?? "",
    amount,
    balance: fields[balanceIndex]
      ? parsePolishAmount(fields[balanceIndex])
      : null,
  };
}

export interface ParseMbankCsvResult {
  transactions: ParsedBankTransaction[];
  invalidRows: number;
}

export function parseMbankCsv(content: string): ParseMbankCsvResult {
  if (!isMbankCsv(content)) {
    throw new ValidationError("Nieobsługiwany format pliku CSV (oczekiwano mBank)");
  }

  const lines = content.split(/\r?\n/);
  const headerIndex = findTransactionHeaderIndex(lines);

  if (headerIndex < 0) {
    throw new ValidationError("Nie znaleziono nagłówka transakcji w pliku mBank");
  }

  const transactions: ParsedBankTransaction[] = [];
  let invalidRows = 0;

  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.startsWith(FOOTER_MARKER)) continue;

    try {
      const parsed = parseTransactionRow(line, i + 1);
      if (parsed) transactions.push(parsed);
    } catch (error) {
      if (error instanceof ValidationError) {
        invalidRows += 1;
        continue;
      }
      throw error;
    }
  }

  return { transactions, invalidRows };
}

export function parseMbankCsvBuffer(buffer: Buffer): ParseMbankCsvResult {
  const content = decodeMbankCsvBuffer(buffer);
  return parseMbankCsv(content);
}
