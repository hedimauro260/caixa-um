import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const positiveAmountSchema = z
  .number()
  .positive('Valor deve ser positivo')
  .max(999_999_999_999.99, 'Valor excede o máximo permitido')
  .multipleOf(0.01, 'Valor deve ter no máximo 2 casas decimais')

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type Pagination = z.infer<typeof paginationSchema>

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc')
export type SortOrder = z.infer<typeof sortOrderSchema>
