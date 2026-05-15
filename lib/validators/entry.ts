import { z } from "zod";

export const createEntrySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    ownerId: z.string().min(1),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const updateEntrySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    ownerId: z.string().min(1).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    },
  );

const yearQuerySchema = z.coerce
  .number()
  .int()
  .min(1970)
  .max(2100)
  .optional();

export const listEntriesQuerySchema = z.object({
  ownerId: z.string().optional(),
  year: yearQuerySchema,
});

export const statsQuerySchema = z.object({
  year: yearQuerySchema,
});

export type CreateEntrySchema = z.infer<typeof createEntrySchema>;
export type UpdateEntrySchema = z.infer<typeof updateEntrySchema>;
