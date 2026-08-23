import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const accountIdParamSchema = z.object({
  accountId: z.string().uuid(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type AccountIdParam = z.infer<typeof accountIdParamSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
