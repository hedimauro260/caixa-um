import { z } from "zod";

const transactionTypeValues = ["INCOME", "EXPENSE", "TRANSFER"] as const;

export const journalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(transactionTypeValues).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type JournalQuery = z.infer<typeof journalQuerySchema>;
