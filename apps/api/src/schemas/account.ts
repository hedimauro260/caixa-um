import { z } from "zod";

const accountTypeValues = ["BANK", "CASH", "DIGITAL_WALLET", "CREDIT_CARD"] as const;

export const createAccountSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(accountTypeValues),
  initialBalance: z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Must be a valid decimal with up to 2 decimal places"),
  currency: z.literal("AOA"),
  description: z.string().max(200).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  includeInTotal: z.boolean().optional().default(true),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  includeInTotal: z.boolean().optional(),
});

export type CreateAccountBody = z.infer<typeof createAccountSchema>;
export type UpdateAccountBody = z.infer<typeof updateAccountSchema>;
