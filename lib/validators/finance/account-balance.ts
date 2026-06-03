import { z } from "zod";

export const updateAccountBalanceSchema = z.object({
  balance: z.coerce.number().min(0),
  asOf: z.coerce.date().optional(),
});

export type UpdateAccountBalanceInput = z.infer<typeof updateAccountBalanceSchema>;
