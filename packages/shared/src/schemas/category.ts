import { z } from 'zod'
import { uuidSchema, paginationSchema } from './common'

export const categoryTypeSchema = z.enum(['income', 'expense', 'transfer'])
export type CategoryType = z.infer<typeof categoryTypeSchema>

export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato #RRGGBB')

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  type: categoryTypeSchema,
  icon: z.string().max(10).optional(),
  color: colorSchema.optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(10).nullable().optional(),
  color: colorSchema.nullable().optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export const listCategoriesQuerySchema = z.object({
  type: categoryTypeSchema.optional(),
  includeArchived: z.coerce.boolean().default(false),
  search: z.string().max(50).optional(),
  ...paginationSchema.shape,
})

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>

export const categoryResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  type: categoryTypeSchema,
  icon: z.string().nullable(),
  color: z.string().nullable(),
  isSystem: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CategoryResponse = z.infer<typeof categoryResponseSchema>
