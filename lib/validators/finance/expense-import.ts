import { z } from "zod";

export const expenseImportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export type ExpenseImportQuerySchema = z.infer<typeof expenseImportQuerySchema>;

export const MAX_EXPENSE_IMPORT_FILE_SIZE = 2 * 1024 * 1024;
