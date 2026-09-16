import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  date,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'
import { accounts } from './accounts'
import { categories } from './categories'

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'restrict' }),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'restrict' }),
    fromAccountId: uuid('from_account_id').references(() => accounts.id, { onDelete: 'restrict' }),
    toAccountId: uuid('to_account_id').references(() => accounts.id, { onDelete: 'restrict' }),
    amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
    description: text('description'),
    date: date('date').notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('transactions_user_id_idx').on(table.userId),
    dateIdx: index('transactions_date_idx').on(table.date),
    accountIdx: index('transactions_account_id_idx').on(table.accountId),
    categoryIdx: index('transactions_category_id_idx').on(table.categoryId),
    typeIdx: index('transactions_type_idx').on(table.type),
    userDateIdx: index('transactions_user_date_idx').on(table.userId, table.date),
    typeCheck: check(
      'transactions_type_check',
      sql`${table.type} IN ('income', 'expense', 'transfer')`
    ),
    amountPositive: check('transactions_amount_positive', sql`${table.amount} > 0`),
    structureCheck: check(
      'transactions_structure_check',
      sql`
        (
          ${table.type} IN ('income', 'expense')
          AND ${table.accountId} IS NOT NULL
          AND ${table.fromAccountId} IS NULL
          AND ${table.toAccountId} IS NULL
        )
        OR
        (
          ${table.type} = 'transfer'
          AND ${table.accountId} IS NULL
          AND ${table.fromAccountId} IS NOT NULL
          AND ${table.toAccountId} IS NOT NULL
          AND ${table.fromAccountId} <> ${table.toAccountId}
        )
      `
    ),
  })
)

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
