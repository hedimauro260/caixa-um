import { Hono } from 'hono'
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuerySchema,
  summaryQuerySchema,
} from '@caixa1/shared'
import type { AppContext } from '../lib/context'
import { requireAuth } from '../middleware/auth'
import { resolveUserId } from '../lib/auth'
import { parseBody, parseQuery, parseParams, idParamSchema } from '../lib/validate'
import {
  createTransaction,
  listTransactions,
  getTransactionById,
  updateTransaction,
  archiveTransaction,
  unarchiveTransaction,
  deleteTransaction,
  getSummary,
} from '../services/transactions'

export const transactionsRoute = new Hono<AppContext>()

transactionsRoute.get('/summary', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, summaryQuerySchema)

  const summary = await getSummary(
    db,
    userId,
    query.startDate,
    query.endDate,
    query.accountId
  )

  return c.json({
    data: {
      ...summary,
      period: {
        startDate: query.startDate ?? null,
        endDate: query.endDate ?? null,
      },
    },
  })
})

transactionsRoute.post('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const input = await parseBody(c, createTransactionSchema)

  const transaction = await createTransaction(db, userId, input)

  return c.json({ data: transaction }, 201)
})

transactionsRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, listTransactionsQuerySchema)

  const { data, total } = await listTransactions(db, userId, query)

  return c.json({
    data,
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
    },
  })
})

transactionsRoute.get('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const transaction = await getTransactionById(db, userId, id)

  return c.json({ data: transaction })
})

transactionsRoute.patch('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)
  const input = await parseBody(c, updateTransactionSchema)

  const transaction = await updateTransaction(db, userId, id, input)

  return c.json({ data: transaction })
})

transactionsRoute.post('/:id/archive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const transaction = await archiveTransaction(db, userId, id)

  return c.json({ data: transaction })
})

transactionsRoute.post('/:id/unarchive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const transaction = await unarchiveTransaction(db, userId, id)

  return c.json({ data: transaction })
})

transactionsRoute.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  await deleteTransaction(db, userId, id)

  return c.body(null, 204)
})
