import { and, asc, desc, eq, gte, ilike, lte, sql, type SQL } from 'drizzle-orm'
import { journal, type Database } from '@caixa1/db'
import { notFound } from '../lib/errors'
import type {
  ListJournalQuery,
  ExportJournalQuery,
  JournalEntryResponse,
  TransactionType,
} from '@caixa1/shared'

/**
 * Service de Journal.
 *
 * READ-ONLY. Não há create/update/delete.
 *
 * A view `journal` já está populada no banco (criada na Parte 1
 * via migração 0001_triggers_and_journal.sql). Este service apenas
 * lê, filtra e ordena.
 *
 * Filtros suportados:
 * - accountId: filtra entries de uma conta específica
 * - type: income | expense | transfer
 * - startDate / endDate: período
 * - search: descrição (ILIKE) ou nome de categoria
 * - paginação: limit / offset
 *
 * TODO (Fase 2): expor categoryId na view para permitir filtro por
 * categoria. Atualmente a view só carrega `category_name`
 * (denormalizado). Filtrar por nome funciona via `search`, mas não
 * é o mesmo.
 */

function toResponse(row: typeof journal.$inferSelect): JournalEntryResponse {
  return {
    id: row.id ?? '',
    date: row.date ?? '',
    createdAt: row.createdAt?.toISOString() ?? '',
    description: row.description,
    categoryName: row.categoryName,
    accountId: row.accountId,
    accountName: row.accountName,
    type: (row.type ?? 'income') as TransactionType,
    signedAmount: row.signedAmount ?? '0.00',
    balance: row.balance ?? '0.00',
    transactionId: row.transactionId ?? '',
  }
}

export async function listJournal(
  db: Database,
  userId: string,
  query: ListJournalQuery
): Promise<{ data: JournalEntryResponse[]; total: number }> {
  const conditions: SQL[] = [eq(journal.userId, userId)]

  if (query.accountId) {
    conditions.push(eq(journal.accountId, query.accountId))
  }

  if (query.type) {
    conditions.push(eq(journal.type, query.type))
  }

  if (query.startDate) {
    conditions.push(gte(journal.date, query.startDate))
  }

  if (query.endDate) {
    conditions.push(lte(journal.date, query.endDate))
  }

  if (query.search) {
    conditions.push(
      sql`(${ilike(journal.description, `%${query.search}%`)} OR ${ilike(journal.categoryName, `%${query.search}%`)})`
    )
  }

  const where = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(journal)
    .where(where)

  const rows = await db
    .select()
    .from(journal)
    .where(where)
    .orderBy(desc(journal.date), desc(journal.createdAt), desc(journal.id))
    .limit(query.limit)
    .offset(query.offset)

  return {
    data: rows.map(toResponse),
    total: count,
  }
}

/**
 * Exporta entries do journal como CSV.
 *
 * Diferenças de `listJournal`:
 * - SEM paginação (exporta tudo que bate no filtro)
 * - Ordem ASCENDENTE (leitura cronológica, não "mais recente primeiro")
 * - Hard limit de 10.000 linhas (proteção de memória do Worker)
 * - Retorna um objeto com o CSV + metadados (total, truncated)
 */
export async function exportJournal(
  db: Database,
  userId: string,
  query: ExportJournalQuery
): Promise<{ entries: JournalEntryResponse[]; truncated: boolean; total: number }> {
  const EXPORT_LIMIT = 10_000

  const conditions: SQL[] = [eq(journal.userId, userId)]

  if (query.accountId) {
    conditions.push(eq(journal.accountId, query.accountId))
  }

  if (query.type) {
    conditions.push(eq(journal.type, query.type))
  }

  if (query.startDate) {
    conditions.push(gte(journal.date, query.startDate))
  }

  if (query.endDate) {
    conditions.push(lte(journal.date, query.endDate))
  }

  if (query.search) {
    conditions.push(
      sql`(${ilike(journal.description, `%${query.search}%`)} OR ${ilike(journal.categoryName, `%${query.search}%`)})`
    )
  }

  const where = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(journal)
    .where(where)

  const rows = await db
    .select()
    .from(journal)
    .where(where)
    .orderBy(asc(journal.date), asc(journal.createdAt), asc(journal.id))
    .limit(EXPORT_LIMIT + 1)

  const truncated = rows.length > EXPORT_LIMIT
  const entries = (truncated ? rows.slice(0, EXPORT_LIMIT) : rows).map(toResponse)

  return {
    entries,
    truncated,
    total: count,
  }
}

export async function getJournalEntryById(
  db: Database,
  userId: string,
  entryId: string
): Promise<JournalEntryResponse> {
  const [row] = await db
    .select()
    .from(journal)
    .where(and(eq(journal.id, entryId), eq(journal.userId, userId)))
    .limit(1)

  if (!row) {
    throw notFound('Journal entry')
  }

  return toResponse(row)
}

export async function getBalanceAtDate(
  db: Database,
  userId: string,
  accountId: string,
  date: string
): Promise<string> {
  const [row] = await db
    .select({ balance: journal.balance })
    .from(journal)
    .where(
      and(
        eq(journal.userId, userId),
        eq(journal.accountId, accountId),
        lte(journal.date, date)
      )
    )
    .orderBy(desc(journal.date), desc(journal.createdAt), desc(journal.id))
    .limit(1)

  return row?.balance ?? '0.00'
}