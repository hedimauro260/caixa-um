import { z } from "zod";

export const historicalDateParamSchema = z.object({
  accountId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type HistoricalDateParam = z.infer<typeof historicalDateParamSchema>;
