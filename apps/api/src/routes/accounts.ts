import { Hono } from 'hono'
import {
  createAccountSchema,
  updateAccountSchema,
  listAccountsQuerySchema,
} from '@caixa1/shared'
import type { AppContext } from '../lib/context'
import { requireAuth } from '../middleware/auth'
import { resolveUserId } from '../lib/auth'
import { parseBody, parseQuery, parseParams, idParamSchema } from '../lib/validate'
import {
  createAccount,
  listAccounts,
  getAccountById,
  updateAccount,
  archiveAccount,
  unarchiveAccount,
  deleteAccount,
} from '../services/accounts'

export const accountsRoute = new Hono<AppContext>()

accountsRoute.post('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const input = await parseBody(c, createAccountSchema)

  const account = await createAccount(db, userId, input)

  return c.json({ data: account }, 201)
})

accountsRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, listAccountsQuerySchema)

  const { data, total } = await listAccounts(db, userId, query)

  return c.json({
    data,
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
    },
  })
})

accountsRoute.get('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const account = await getAccountById(db, userId, id)

  return c.json({ data: account })
})

accountsRoute.patch('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)
  const input = await parseBody(c, updateAccountSchema)

  const account = await updateAccount(db, userId, id, input)

  return c.json({ data: account })
})

accountsRoute.post('/:id/archive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const account = await archiveAccount(db, userId, id)

  return c.json({ data: account })
})

accountsRoute.post('/:id/unarchive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const account = await unarchiveAccount(db, userId, id)

  return c.json({ data: account })
})

accountsRoute.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  await deleteAccount(db, userId, id)

  return c.body(null, 204)
})
