import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");
const amountSchema = z.string().regex(/^-?\d+(\.\d{1,2})?$/, "Must be a valid decimal with up to 2 decimal places");

export const createIncomeSchema = z.object({
  accountId: z.string().uuid(),
  amount: amountSchema,
  currency: z.literal("AOA"),
  categoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(3).max(200),
  date: dateSchema,
});

export const createExpenseSchema = z.object({
  accountId: z.string().uuid(),
  amount: amountSchema,
  currency: z.literal("AOA"),
  categoryId: z.string().uuid().optional().nullable(),
  description: z.string().min(3).max(200),
  date: dateSchema,
});

export const createTransferSchema = z.object({
  originAccountId: z.string().uuid(),
  destinationAccountId: z.string().uuid(),
  amount: amountSchema,
  currency: z.literal("AOA"),
  description: z.string().min(3).max(200),
  date: dateSchema,
});

export const updateTransactionSchema = z.object({
  description: z.string().min(3).max(200).optional(),
  date: dateSchema.optional(),
  categoryId: z.string().uuid().optional().nullable(),
});

export type CreateIncomeBody = z.infer<typeof createIncomeSchema>;
export type CreateExpenseBody = z.infer<typeof createExpenseSchema>;
export type CreateTransferBody = z.infer<typeof createTransferSchema>;
export type UpdateTransactionBody = z.infer<typeof updateTransactionSchema>;
