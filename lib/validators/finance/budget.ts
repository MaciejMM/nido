import { z } from "zod";

export const budgetQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const upsertBudgetSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  limitAmount: z.coerce.number().min(0),
});

export type BudgetQuerySchema = z.infer<typeof budgetQuerySchema>;
export type UpsertBudgetSchema = z.infer<typeof upsertBudgetSchema>;
