import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Imię jest wymagane"),
  email: z.string().trim().email("Nieprawidłowy adres e-mail"),
  role: z.enum(["parentA", "parentB"]),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(["parentA", "parentB"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Brak danych do aktualizacji",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
