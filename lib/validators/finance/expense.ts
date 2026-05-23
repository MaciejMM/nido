import { z } from "zod";

import { coerceCalendarDate } from "@/utils/dates";

const amountSchema = z.coerce.number().positive();

const calendarDateSchema = z.preprocess(
  (value) => coerceCalendarDate(value),
  z.date(),
);

export const createExpenseSchema = z.object({
  amount: amountSchema,
  title: z.string().trim().min(1).max(200),
  categoryId: z.string().min(1),
  date: calendarDateSchema,
  notes: z.string().trim().max(1000).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesQuerySchema = z.object({
  categoryId: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const bulkUpdateExpenseCategorySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
  categoryId: z.string().min(1),
});

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQuerySchema = z.infer<typeof listExpensesQuerySchema>;
export type BulkUpdateExpenseCategorySchema = z.infer<
  typeof bulkUpdateExpenseCategorySchema
>;
