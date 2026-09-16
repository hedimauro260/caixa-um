import { z } from 'zod'
import { uuidSchema, paginationSchema } from './common'

export const accountTypeSchema = z.enum([
  'checking',
  'savings',
  'credit_card',
  'cash',
  'investment',
])

export type AccountType = z.infer<typeof accountTypeSchema>

export const currencySchema = z.enum(['BRL', 'USD', 'EUR'])
export type Currency = z.infer<typeof currencySchema>

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  type: accountTypeSchema,
  currency: currencySchema.default('BRL'),
  initialBalance: z
    .number()
    .min(0, 'Saldo inicial não pode ser negativo')
    .max(999_999_999_999.99)
    .multipleOf(0.01)
    .default(0),
})

export type CreateAccountInput = z.infer<typeof createAccountSchema>

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>

export const listAccountsQuerySchema = z.object({
  type: accountTypeSchema.optional(),
  includeArchived: z.coerce.boolean().default(false),
  search: z.string().max(100).optional(),
  ...paginationSchema.shape,
})

export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>

export const accountResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  type: accountTypeSchema,
  balance: z.string(),
  currency: currencySchema,
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AccountResponse = z.infer<typeof accountResponseSchema>
