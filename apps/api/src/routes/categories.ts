import { Hono } from 'hono'
import {
  createCategorySchema,
  updateCategorySchema,
  listCategoriesQuerySchema,
} from '@caixa1/shared'
import type { AppContext } from '../lib/context'
import { requireAuth } from '../middleware/auth'
import { resolveUserId } from '../lib/auth'
import { parseBody, parseQuery, parseParams, idParamSchema } from '../lib/validate'
import {
  createCategory,
  listCategories,
  getCategoryById,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
  deleteCategory,
} from '../services/categories'

export const categoriesRoute = new Hono<AppContext>()

categoriesRoute.post('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const input = await parseBody(c, createCategorySchema)

  const category = await createCategory(db, userId, input)

  return c.json({ data: category }, 201)
})

categoriesRoute.get('/', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const query = parseQuery(c, listCategoriesQuerySchema)

  const { data, total } = await listCategories(db, userId, query)

  return c.json({
    data,
    meta: {
      total,
      limit: query.limit,
      offset: query.offset,
    },
  })
})

categoriesRoute.get('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const category = await getCategoryById(db, userId, id)

  return c.json({ data: category })
})

categoriesRoute.patch('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)
  const input = await parseBody(c, updateCategorySchema)

  const category = await updateCategory(db, userId, id, input)

  return c.json({ data: category })
})

categoriesRoute.post('/:id/archive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const category = await archiveCategory(db, userId, id)

  return c.json({ data: category })
})

categoriesRoute.post('/:id/unarchive', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  const category = await unarchiveCategory(db, userId, id)

  return c.json({ data: category })
})

categoriesRoute.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db')
  const userId = await resolveUserId(db, c.get('userId'))

  const { id } = parseParams(c, idParamSchema)

  await deleteCategory(db, userId, id)

  return c.body(null, 204)
})
