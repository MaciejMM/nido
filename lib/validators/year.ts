import { z } from "zod";

export const yearValueSchema = z.coerce
  .number()
  .int("Rok musi być liczbą całkowitą")
  .min(1970, "Rok musi być nie wcześniejszy niż 1970")
  .max(2100, "Rok musi być nie późniejszy niż 2100");

export const createYearSchema = z.object({
  value: yearValueSchema,
});

export type CreateYearInput = z.infer<typeof createYearSchema>;
