import type { ParsedBankTransaction } from "@/lib/finance/bank-import/mbank-parser";
import { DEFAULT_HOUSEHOLD_ID } from "@/lib/finance/constants";
import {
  AccountBalance,
  type AccountBalanceSource,
  type IAccountBalance,
} from "@/models/AccountBalance";
import type { AccountBalanceDto } from "@/types";

export function resolveClosingBalanceFromTransactions(
  transactions: ParsedBankTransaction[],
): { balance: number; asOf: Date } | null {
  for (let i = transactions.length - 1; i >= 0; i -= 1) {
    const transaction = transactions[i];
    if (transaction.balance == null) continue;

    return {
      balance: transaction.balance,
      asOf: transaction.operationDate,
    };
  }

  return null;
}

function toDto(record: IAccountBalance): AccountBalanceDto {
  return {
    balance: record.balance,
    asOf: record.asOf.toISOString(),
    source: record.source,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function getAccountBalance(
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<AccountBalanceDto | null> {
  const record = await AccountBalance.findOne({ householdId }).exec();
  return record ? toDto(record) : null;
}

export async function upsertAccountBalanceFromImport(
  transactions: ParsedBankTransaction[],
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<AccountBalanceDto | null> {
  const closing = resolveClosingBalanceFromTransactions(transactions);
  if (!closing) return null;

  return setAccountBalance(
    closing.balance,
    closing.asOf,
    "import",
    householdId,
  );
}

export async function setAccountBalance(
  balance: number,
  asOf: Date,
  source: AccountBalanceSource,
  householdId = DEFAULT_HOUSEHOLD_ID,
): Promise<AccountBalanceDto> {
  const record = await AccountBalance.findOneAndUpdate(
    { householdId },
    { balance, asOf, source },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  return toDto(record!);
}
