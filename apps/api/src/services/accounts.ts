import { and, eq, ilike, sql, type SQL } from 'drizzle-orm'
import { accounts, categories, type Database } from '@caixa1/db'
import { badRequest, conflict, notFound } from '../lib/errors'
import { createTransaction } from './transactions'
import type {
  CreateAccountInput,
  UpdateAccountInput,
  ListAccountsQuery,
  AccountResponse,
} from '@caixa1/shared'

function toResponse(row: typeof accounts.$inferSelect): AccountResponse {
  return {
    id: row.id,
    name: row.name,
    type: row.type as AccountResponse['type'],
    balance: row.balance,
    currency: row.currency as AccountResponse['currency'],
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

export async function createAccount(
  db: Database,
  userId: string,
  input: CreateAccountInput
): Promise<AccountResponse> {
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.isArchived, false),
        sql`LOWER(${accounts.name}) = LOWER(${input.name})`
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw conflict(`Já existe uma conta com o nome "${input.name}"`)
  }

  const [created] = await db
    .insert(accounts)
    .values({
      userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      balance: '0',
    })
    .returning()

  if (input.initialBalance > 0) {
    const saldoInicialCategoryId = await getSystemCategoryId(
      db,
      userId,
      'Saldo inicial'
    )

    await createTransaction(db, userId, {
      type: 'income',
      accountId: created.id,
      categoryId: saldoInicialCategoryId,
      amount: input.initialBalance,
      date: new Date().toISOString().slice(0, 10),
      description: 'Saldo inicial',
    })

    return getAccountById(db, userId, created.id)
  }

  return toResponse(created)
}

export async function listAccounts(
  db: Database,
  userId: string,
  query: ListAccountsQuery
): Promise<{ data: AccountResponse[]; total: number }> {
  const conditions: SQL[] = [eq(accounts.userId, userId)]

  if (!query.includeArchived) {
    conditions.push(eq(accounts.isArchived, false))
  }

  if (query.type) {
    conditions.push(eq(accounts.type, query.type))
  }

  if (query.search) {
    conditions.push(ilike(accounts.name, `%${query.search}%`))
  }

  const where = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(accounts)
    .where(where)

  const rows = await db
    .select()
    .from(accounts)
    .where(where)
    .orderBy(accounts.createdAt)
    .limit(query.limit)
    .offset(query.offset)

  return {
    data: rows.map(toResponse),
    total: count,
  }
}

export async function getAccountById(
  db: Database,
  userId: string,
  accountId: string
): Promise<AccountResponse> {
  const [row] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1)

  if (!row) {
    throw notFound('Conta')
  }

  return toResponse(row)
}

export async function updateAccount(
  db: Database,
  userId: string,
  accountId: string,
  input: UpdateAccountInput
): Promise<AccountResponse> {
  await getAccountById(db, userId, accountId)

  if (input.name) {
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, userId),
          eq(accounts.isArchived, false),
          sql`LOWER(${accounts.name}) = LOWER(${input.name})`,
          sql`${accounts.id} != ${accountId}`
        )
      )
      .limit(1)

    if (existing.length > 0) {
      throw conflict(`Já existe uma conta com o nome "${input.name}"`)
    }
  }

  const [updated] = await db
    .update(accounts)
    .set({
      ...(input.name !== undefined && { name: input.name }),
    })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function archiveAccount(
  db: Database,
  userId: string,
  accountId: string
): Promise<AccountResponse> {
  const account = await getAccountById(db, userId, accountId)

  if (account.isArchived) {
    throw badRequest('Conta já está arquivada')
  }

  if (parseFloat(account.balance) !== 0) {
    throw badRequest(
      `Não é possível arquivar conta com saldo (${account.balance}). Transfira o saldo para outra conta primeiro.`
    )
  }

  const [updated] = await db
    .update(accounts)
    .set({ isArchived: true })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function unarchiveAccount(
  db: Database,
  userId: string,
  accountId: string
): Promise<AccountResponse> {
  const account = await getAccountById(db, userId, accountId)

  if (!account.isArchived) {
    throw badRequest('Conta não está arquivada')
  }

  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, userId),
        eq(accounts.isArchived, false),
        sql`LOWER(${accounts.name}) = LOWER(${account.name})`
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw conflict(
      `Já existe uma conta ativa com o nome "${account.name}". Renomeie-a primeiro.`
    )
  }

  const [updated] = await db
    .update(accounts)
    .set({ isArchived: false })
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function deleteAccount(
  db: Database,
  userId: string,
  accountId: string
): Promise<void> {
  const account = await getAccountById(db, userId, accountId)

  if (!account.isArchived) {
    throw badRequest(
      'Conta precisa estar arquivada antes de ser deletada permanentemente'
    )
  }

  try {
    await db
      .delete(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
  } catch (err) {
    const pgErr = err as { code?: string }
    if (pgErr.code === '23503') {
      throw conflict(
        'Não é possível deletar: existem transações vinculadas a esta conta'
      )
    }
    throw err
  }
}

async function getSystemCategoryId(
  db: Database,
  userId: string,
  name: string
): Promise<string> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.name, name),
        eq(categories.isSystem, true)
      )
    )
    .limit(1)

  if (row) {
    return row.id
  }

  const [created] = await db
    .insert(categories)
    .values({
      userId,
      name,
      type: 'income',
      isSystem: true,
      isArchived: false,
    })
    .onConflictDoNothing({
      target: [categories.userId, categories.name, categories.type],
    })
    .returning()

  if (created) {
    return created.id
  }

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.name, name),
        eq(categories.type, 'income')
      )
    )
    .limit(1)

  if (!existing) {
    throw new Error(`Categoria de sistema "${name}" não encontrada`)
  }

  return existing.id
}
