import { z } from "zod";

const monthlyLimitField = z
  .number()
  .min(0)
  .max(1_000_000)
  .nullable()
  .optional();

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().min(1).max(80),
  color: z.string().trim().min(1).max(32),
  monthlyLimit: monthlyLimitField,
});

export const updateCategorySchema = z.object({
  monthlyLimit: monthlyLimitField,
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
