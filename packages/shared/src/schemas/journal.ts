import { z } from 'zod'
import { uuidSchema, dateOnlySchema, paginationSchema } from './common'
import { transactionTypeSchema } from './transaction'

export const listJournalQuerySchema = z.object({
  accountId: uuidSchema.optional(),
  categoryId: uuidSchema.optional(),
  type: transactionTypeSchema.optional(),
  startDate: dateOnlySchema.optional(),
  endDate: dateOnlySchema.optional(),
  search: z.string().max(255).optional(),
  ...paginationSchema.shape,
})

export type ListJournalQuery = z.infer<typeof listJournalQuerySchema>

export const journalEntryResponseSchema = z.object({
  id: z.string(),
  date: z.string(),
  createdAt: z.string(),
  description: z.string().nullable(),
  categoryName: z.string().nullable(),
  accountId: uuidSchema.nullable(),
  accountName: z.string().nullable(),
  type: transactionTypeSchema,
  signedAmount: z.string(),
  balance: z.string(),
  transactionId: uuidSchema,
})

export type JournalEntryResponse = z.infer<typeof journalEntryResponseSchema>

export const exportJournalQuerySchema = listJournalQuerySchema.omit({
  limit: true,
  offset: true,
})

export type ExportJournalQuery = z.infer<typeof exportJournalQuerySchema>
