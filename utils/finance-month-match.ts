import { getMonthDateRange } from "@/utils/finance-dates";

export interface ExpenseMonthFields {
  date: Date;
  attributedYear?: number | null;
  attributedMonth?: number | null;
}

export function isExpenseAttributedToMonth(
  expense: ExpenseMonthFields,
  year: number,
  month: number,
): boolean {
  return expense.attributedYear === year && expense.attributedMonth === month;
}

export function isExpenseDateInMonth(
  expense: Pick<ExpenseMonthFields, "date">,
  year: number,
  month: number,
): boolean {
  const { start, end } = getMonthDateRange(year, month);
  return expense.date >= start && expense.date <= end;
}

export function isCarriedFromPreviousMonth(
  expense: ExpenseMonthFields,
  viewYear: number,
  viewMonth: number,
): boolean {
  return (
    isExpenseAttributedToMonth(expense, viewYear, viewMonth) &&
    !isExpenseDateInMonth(expense, viewYear, viewMonth)
  );
}

export function buildExpenseMonthMatch(
  year: number,
  month: number,
): Record<string, unknown> {
  const { start, end } = getMonthDateRange(year, month);

  return {
    $or: [
      { attributedYear: year, attributedMonth: month },
      {
        $and: [
          {
            $or: [
              { attributedYear: { $exists: false } },
              { attributedYear: null },
            ],
          },
          { date: { $gte: start, $lte: end } },
        ],
      },
    ],
  };
}
