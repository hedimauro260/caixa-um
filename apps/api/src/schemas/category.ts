import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().max(200).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional().nullable(),
  color: z.string().max(7).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
});

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
