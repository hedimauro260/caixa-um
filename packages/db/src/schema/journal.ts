import { pgView, uuid, text, timestamp, decimal, date } from 'drizzle-orm/pg-core'

export const journal = pgView('journal', {
  id: text('id'),
  userId: uuid('user_id'),
  date: date('date'),
  createdAt: timestamp('created_at', { withTimezone: true }),
  description: text('description'),
  categoryName: text('category_name'),
  accountId: uuid('account_id'),
  accountName: text('account_name'),
  type: text('type'),
  signedAmount: decimal('signed_amount', { precision: 14, scale: 2 }),
  balance: decimal('balance', { precision: 14, scale: 2 }),
  transactionId: uuid('transaction_id'),
}).existing()

export type JournalEntry = typeof journal.$inferSelect
