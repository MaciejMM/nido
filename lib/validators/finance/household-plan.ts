import { z } from "zod";

const amountSchema = z.coerce.number().min(0);
const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2000).max(2100);

export const listHouseholdPlanQuerySchema = z.object({
  year: yearSchema,
  month: monthSchema,
});

export const createHouseholdLineSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  kind: z.enum(["income", "expense"]),
  title: z.string().trim().min(1).max(200),
  amount: amountSchema,
  notes: z.string().trim().max(1000).optional(),
});

export const updateHouseholdLineSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  amount: amountSchema.optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateHouseholdSettingsSchema = z.object({
  year: yearSchema,
  month: monthSchema,
  personalInclusion: z.enum(["all", "consolidated", "none"]),
});

export const copyHouseholdPlanSchema = z.object({
  year: yearSchema,
  month: monthSchema,
});
