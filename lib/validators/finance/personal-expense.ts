import { z } from "zod";

const amountSchema = z.coerce.number().min(0);

const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2000).max(2100);

export const listPersonalExpensesQuerySchema = z.object({
  year: yearSchema,
  month: monthSchema,
});

export const createPersonalExpenseSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  title: z.string().trim().min(1).max(200),
  amount: amountSchema,
  notes: z.string().trim().max(1000).optional(),
  visibility: z.enum(["private", "shared"]).optional(),
});

export const updatePersonalExpenseSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  amount: amountSchema.optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
  visibility: z.enum(["private", "shared"]).optional(),
});

export const patchPersonalExpenseSchema = z.object({
  isPaid: z.boolean().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  amount: amountSchema.optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const copyFromPreviousMonthSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  expenseIds: z.array(z.string().trim().min(1)).min(1),
});

export type ListPersonalExpensesQuerySchema = z.infer<
  typeof listPersonalExpensesQuerySchema
>;
export type CreatePersonalExpenseSchema = z.infer<
  typeof createPersonalExpenseSchema
>;
export type UpdatePersonalExpenseSchema = z.infer<
  typeof updatePersonalExpenseSchema
>;
export type PatchPersonalExpenseSchema = z.infer<
  typeof patchPersonalExpenseSchema
>;
export type CopyFromPreviousMonthSchema = z.infer<
  typeof copyFromPreviousMonthSchema
>;
