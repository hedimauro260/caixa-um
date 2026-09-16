import { and, eq } from 'drizzle-orm'
import { accounts, categories, type Database } from '@caixa1/db'
import { notFound } from './errors'

export async function assertAccountOwnership(
  db: Database,
  userId: string,
  accountId: string
): Promise<void> {
  const [row] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1)

  if (!row) {
    throw notFound('Conta')
  }
}

export async function assertCategoryOwnership(
  db: Database,
  userId: string,
  categoryId: string
): Promise<void> {
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1)

  if (!row) {
    throw notFound('Categoria')
  }
}
