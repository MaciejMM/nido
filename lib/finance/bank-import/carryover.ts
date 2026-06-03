import type { ParsedBankTransaction } from "@/lib/finance/bank-import/mbank-parser";
import { MIN_PAYCHECK_AMOUNT_PLN } from "@/lib/finance/constants";
import { getMonthDateRange, getPreviousMonth } from "@/utils/finance-dates";

export interface IncomeDepositAnchor {
  operationDate: Date;
  transactionIndex: number;
}

export function isPaycheckDeposit(transaction: ParsedBankTransaction): boolean {
  return transaction.amount >= MIN_PAYCHECK_AMOUNT_PLN;
}

export function findLastPaycheckInMonth(
  transactions: ParsedBankTransaction[],
  year: number,
  month: number,
): IncomeDepositAnchor | null {
  const { start, end } = getMonthDateRange(year, month);
  let anchor: IncomeDepositAnchor | null = null;

  for (let i = 0; i < transactions.length; i += 1) {
    const transaction = transactions[i];
    if (!isPaycheckDeposit(transaction)) continue;

    const operationDate = transaction.operationDate;
    if (operationDate < start || operationDate > end) continue;

    anchor = { operationDate, transactionIndex: i };
  }

  return anchor;
}

export function isDebitAfterPaycheck(
  transaction: ParsedBankTransaction,
  transactionIndex: number,
  anchor: IncomeDepositAnchor,
): boolean {
  if (transaction.amount >= 0) return false;

  const operationDate = transaction.operationDate;
  if (operationDate > anchor.operationDate) return true;
  if (operationDate < anchor.operationDate) return false;

  return transactionIndex > anchor.transactionIndex;
}

export function getCarryoverDebitsFromPreviousMonth(
  transactions: ParsedBankTransaction[],
  targetYear: number,
  targetMonth: number,
): ParsedBankTransaction[] {
  const { year: prevYear, month: prevMonth } = getPreviousMonth(
    targetYear,
    targetMonth,
  );
  const anchor = findLastPaycheckInMonth(transactions, prevYear, prevMonth);
  if (!anchor) return [];

  const { start: prevStart, end: prevEnd } = getMonthDateRange(
    prevYear,
    prevMonth,
  );
  const carryover: ParsedBankTransaction[] = [];

  for (let i = 0; i < transactions.length; i += 1) {
    const transaction = transactions[i];
    if (transaction.amount >= 0) continue;

    const operationDate = transaction.operationDate;
    if (operationDate < prevStart || operationDate > prevEnd) continue;
    if (!isDebitAfterPaycheck(transaction, i, anchor)) continue;

    carryover.push(transaction);
  }

  return carryover;
}
