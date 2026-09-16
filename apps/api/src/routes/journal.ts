import { Hono } from 'hono'
import { z } from 'zod'
import { listJournalQuerySchema, exportJournalQuerySchema } from '@caixa1/shared'
import type { AppContext } from '../lib/context'
import { requireAuth } from '../middleware/auth'
import { resolveUserId } from '../lib/auth'
import { parseQuery, parseParams } from '../lib/validate'
import { toCsv } from '../lib/csv'
import { listJournal, getJournalEntryById, exportJournal } from '../services/journal'

/**
 * Rotas de Journal.
 *
 * READ-ONLY. Não há POST/PATCH/DELETE.
 *
 * O journal é uma view consolidada das transações.
 * A fonte de verdade são as transações — se quiser modificar
 * algo, modifique a transação correspondente.
 *
 * Endpoints:
 * - GET /journal/export → CSV com as entries filtradas
 * - GET /journal        → lista entries com filtros
 * - GET /journal/:id    → busca entry por ID (deep linking)
 *
 * O `:id` de journal não precisa ser UUID (a view pode usar
 * identificadores compostos). Por isso usamos um schema próprio.
 *
 * ATENÇÃO À ORDEM: /export precisa vir ANTES de /:id.
 */

export const journalRoute = new Hono<AppContext>()

const journalIdParamSchema = z.object({
  id: z.string().min(1).max(100),
})

// -----------------------------------------------------------------------------
// GET /journal/export — exportar CSV
// ATENÇÃO: ANTES de /:id
// -----------------------------------------------------------------------------

journalRoute.get('/export', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, exportJournalQuerySchema)

  const { entries, truncated, total } = await exportJournal(db, userId, query)

  const headers = [
    'Data',
    'Descrição',
    'Categoria',
    'Conta',
    'Tipo',
    'Valor',
    'Saldo',
    'ID da Transação',
  ]

  const rows = entries.map((e) => [
    e.date,
    e.description ?? '',
    e.categoryName ?? '',
    e.accountName ?? '',
    e.type,
    e.signedAmount,
    e.balance,
    e.transactionId,
  ])

  const csv = toCsv(headers, rows)

  const today = new Date().toISOString().slice(0, 10)
  const filename = `caixa1-journal-${today}.csv`

  c.header('Content-Type', 'text/csv; charset=utf-8')
  c.header('Content-Disposition', `attachment; filename="${filename}"`)
  c.header('X-Total-Count', String(total))
  c.header('X-Export-Count', String(entries.length))
  c.header('X-Truncated', String(truncated))

  return c.body(csv)
})

// -----------------------------------------------------------------------------
// GET /journal — listar
// -----------------------------------------------------------------------------

journalRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, listJournalQuerySchema)

  const { data, total } = await listJournal(db, userId, query)

  return c.json({
    data,
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
    },
  })
})

// -----------------------------------------------------------------------------
// GET /journal/:id — buscar entry por ID
// -----------------------------------------------------------------------------

journalRoute.get('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, journalIdParamSchema)

  const entry = await getJournalEntryById(db, userId, id)

  return c.json({ data: entry })
})