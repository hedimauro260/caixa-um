import { and, eq, ilike, lte, gte, sql, type SQL } from 'drizzle-orm'
import { categories, transactions, type Database } from '@caixa1/db'
import { badRequest, notFound } from '../lib/errors'
import { assertAccountOwnership, assertCategoryOwnership } from '../lib/ownership'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
  TransactionResponse,
  TransactionType,
} from '@caixa1/shared'

function toResponse(row: typeof transactions.$inferSelect): TransactionResponse {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: row.amount,
    description: row.description,
    date: row.date,
    accountId: row.accountId,
    categoryId: row.categoryId,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createTransaction(
  db: Database,
  userId: string,
  input: CreateTransactionInput
): Promise<TransactionResponse> {
  if (input.type === 'transfer') {
    await assertAccountOwnership(db, userId, input.fromAccountId)
    await assertAccountOwnership(db, userId, input.toAccountId)

    if (input.fromAccountId === input.toAccountId) {
      throw badRequest('Conta de origem e destino devem ser diferentes')
    }

    const [created] = await db
      .insert(transactions)
      .values({
        userId,
        type: 'transfer',
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount.toFixed(2),
        description: input.description ?? null,
        date: input.date,
      })
      .returning()

    return toResponse(created)
  }

  await assertAccountOwnership(db, userId, input.accountId)
  await assertCategoryOwnership(db, userId, input.categoryId)

  const [category] = await db
    .select({ type: categories.type })
    .from(categories)
    .where(eq(categories.id, input.categoryId))
    .limit(1)

  if (!category) {
    throw notFound('Categoria')
  }

  if (category.type !== input.type) {
    throw badRequest(
      `Categoria do tipo "${category.type}" não pode ser usada em transação do tipo "${input.type}"`
    )
  }

  const [created] = await db
    .insert(transactions)
    .values({
      userId,
      type: input.type,
      accountId: input.accountId,
      categoryId: input.categoryId,
      amount: input.amount.toFixed(2),
      description: input.description ?? null,
      date: input.date,
    })
    .returning()

  return toResponse(created)
}

export async function listTransactions(
  db: Database,
  userId: string,
  query: ListTransactionsQuery
): Promise<{ data: TransactionResponse[]; total: number }> {
  const conditions: SQL[] = [eq(transactions.userId, userId)]

  if (!query.includeArchived) {
    conditions.push(eq(transactions.isArchived, false))
  }

  if (query.type) {
    conditions.push(eq(transactions.type, query.type))
  }

  if (query.accountId) {
    conditions.push(
      sql`(${transactions.accountId} = ${query.accountId} OR ${transactions.fromAccountId} = ${query.accountId} OR ${transactions.toAccountId} = ${query.accountId})`
    )
  }

  if (query.categoryId) {
    conditions.push(eq(transactions.categoryId, query.categoryId))
  }

  if (query.startDate) {
    conditions.push(gte(transactions.date, query.startDate))
  }

  if (query.endDate) {
    conditions.push(lte(transactions.date, query.endDate))
  }

  if (query.minAmount !== undefined) {
    conditions.push(gte(transactions.amount, query.minAmount.toFixed(2)))
  }

  if (query.maxAmount !== undefined) {
    conditions.push(lte(transactions.amount, query.maxAmount.toFixed(2)))
  }

  if (query.search) {
    conditions.push(ilike(transactions.description, `%${query.search}%`))
  }

  const where = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(transactions)
    .where(where)

  const rows = await db
    .select()
    .from(transactions)
    .where(where)
    .orderBy(sql`${transactions.date} DESC, ${transactions.createdAt} DESC`)
    .limit(query.limit)
    .offset(query.offset)

  return {
    data: rows.map(toResponse),
    total: count,
  }
}

export async function getTransactionById(
  db: Database,
  userId: string,
  transactionId: string
): Promise<TransactionResponse> {
  const [row] = await db
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
    .limit(1)

  if (!row) {
    throw notFound('Transação')
  }

  return toResponse(row)
}

export async function updateTransaction(
  db: Database,
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
): Promise<TransactionResponse> {
  const existing = await getTransactionById(db, userId, transactionId)

  if (existing.type === 'transfer') {
    if (input.fromAccountId !== undefined || input.toAccountId !== undefined) {
      throw badRequest(
        'Não é possível alterar as contas de uma transferência. Arquive e crie uma nova.'
      )
    }
    if (input.categoryId !== undefined) {
      throw badRequest('Transferências não têm categoria')
    }
    if (input.accountId !== undefined) {
      throw badRequest('Transferências usam fromAccountId e toAccountId, não accountId')
    }

    const [updated] = await db
      .update(transactions)
      .set({
        ...(input.amount !== undefined && { amount: input.amount.toFixed(2) }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.date !== undefined && { date: input.date }),
      })
      .where(
        and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
      )
      .returning()

    return toResponse(updated)
  }

  if (input.accountId && input.accountId !== existing.accountId) {
    await assertAccountOwnership(db, userId, input.accountId)
  }

  if (input.categoryId && input.categoryId !== existing.categoryId) {
    await assertCategoryOwnership(db, userId, input.categoryId)

    const [category] = await db
      .select({ type: categories.type })
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1)

    if (!category) {
      throw notFound('Categoria')
    }

    if (category.type !== existing.type) {
      throw badRequest(
        `Categoria do tipo "${category.type}" não pode ser usada em transação do tipo "${existing.type}"`
      )
    }
  }

  const [updated] = await db
    .update(transactions)
    .set({
      ...(input.amount !== undefined && { amount: input.amount.toFixed(2) }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.date !== undefined && { date: input.date }),
      ...(input.accountId !== undefined && { accountId: input.accountId }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
    })
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
    .returning()

  return toResponse(updated)
}

export async function archiveTransaction(
  db: Database,
  userId: string,
  transactionId: string
): Promise<TransactionResponse> {
  await getTransactionById(db, userId, transactionId)

  const [updated] = await db
    .update(transactions)
    .set({ isArchived: true })
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
    .returning()

  return toResponse(updated)
}

export async function unarchiveTransaction(
  db: Database,
  userId: string,
  transactionId: string
): Promise<TransactionResponse> {
  await getTransactionById(db, userId, transactionId)

  const [updated] = await db
    .update(transactions)
    .set({ isArchived: false })
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
    .returning()

  return toResponse(updated)
}

export async function deleteTransaction(
  db: Database,
  userId: string,
  transactionId: string
): Promise<void> {
  const existing = await getTransactionById(db, userId, transactionId)

  if (!existing.isArchived) {
    throw badRequest(
      'Transação precisa estar arquivada antes de ser deletada permanentemente'
    )
  }

  await db
    .delete(transactions)
    .where(
      and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
    )
}

export async function getSummary(
  db: Database,
  userId: string,
  startDate?: string,
  endDate?: string,
  accountId?: string
): Promise<{
  totalIncome: string
  totalExpense: string
  balance: string
  transactionCount: number
}> {
  const conditions: SQL[] = [
    eq(transactions.userId, userId),
    eq(transactions.isArchived, false),
    sql`${transactions.type} IN ('income', 'expense')`,
  ]

  if (startDate) conditions.push(gte(transactions.date, startDate))
  if (endDate) conditions.push(lte(transactions.date, endDate))
  if (accountId) conditions.push(eq(transactions.accountId, accountId))

  const where = and(...conditions)

  const [row] = await db
    .select({
      totalIncome: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)::text`,
      totalExpense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)::text`,
      transactionCount: sql<number>`COUNT(*)::int`,
    })
    .from(transactions)
    .where(where)

  const balance = parseFloat(row.totalIncome) - parseFloat(row.totalExpense)

  return {
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance: balance.toFixed(2),
    transactionCount: row.transactionCount,
  }
}
