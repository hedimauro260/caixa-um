import { z } from 'zod'
import { uuidSchema, positiveAmountSchema, dateOnlySchema, paginationSchema } from './common'

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer'])
export type TransactionType = z.infer<typeof transactionTypeSchema>

const transactionBaseSchema = z.object({
  amount: positiveAmountSchema,
  description: z.string().max(255).optional(),
  date: dateOnlySchema,
})

export const createIncomeSchema = transactionBaseSchema.extend({
  type: z.literal('income'),
  accountId: uuidSchema,
  categoryId: uuidSchema,
})

export const createExpenseSchema = transactionBaseSchema.extend({
  type: z.literal('expense'),
  accountId: uuidSchema,
  categoryId: uuidSchema,
})

export const createTransferSchema = transactionBaseSchema.extend({
  type: z.literal('transfer'),
  fromAccountId: uuidSchema,
  toAccountId: uuidSchema,
})

export const createTransactionSchema = z.discriminatedUnion('type', [
  createIncomeSchema,
  createExpenseSchema,
  createTransferSchema,
]).refine((data) => {
  if (data.type === 'transfer') {
    return data.fromAccountId !== data.toAccountId
  }
  return true
}, {
  message: 'Conta de origem e destino devem ser diferentes',
  path: ['toAccountId'],
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type CreateTransferInput = z.infer<typeof createTransferSchema>

export const updateTransactionSchema = z.object({
  amount: positiveAmountSchema.optional(),
  description: z.string().max(255).nullable().optional(),
  date: dateOnlySchema.optional(),
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  fromAccountId: uuidSchema.optional(),
  toAccountId: uuidSchema.optional(),
})

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>

export const listTransactionsQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  startDate: dateOnlySchema.optional(),
  endDate: dateOnlySchema.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().max(255).optional(),
  includeArchived: z.coerce.boolean().default(false),
  ...paginationSchema.shape,
})

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>

export const summaryQuerySchema = z.object({
  startDate: dateOnlySchema.optional(),
  endDate: dateOnlySchema.optional(),
  accountId: uuidSchema.optional(),
})

export type SummaryQuery = z.infer<typeof summaryQuerySchema>

export const summaryResponseSchema = z.object({
  totalIncome: z.string(),
  totalExpense: z.string(),
  balance: z.string(),
  transactionCount: z.number().int(),
  period: z.object({
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
  }),
})

export type SummaryResponse = z.infer<typeof summaryResponseSchema>

export const transactionResponseSchema = z.object({
  id: uuidSchema,
  type: transactionTypeSchema,
  amount: z.string(),
  description: z.string().nullable(),
  date: z.string(),
  accountId: uuidSchema.nullable(),
  categoryId: uuidSchema.nullable(),
  fromAccountId: uuidSchema.nullable(),
  toAccountId: uuidSchema.nullable(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TransactionResponse = z.infer<typeof transactionResponseSchema>
