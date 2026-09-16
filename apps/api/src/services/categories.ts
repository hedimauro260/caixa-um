import { and, eq, ilike, sql, type SQL } from 'drizzle-orm'
import { categories, type Database } from '@caixa1/db'
import { badRequest, conflict, notFound } from '../lib/errors'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
  CategoryResponse,
  CategoryType,
} from '@caixa1/shared'

function toResponse(row: typeof categories.$inferSelect): CategoryResponse {
  return {
    id: row.id,
    name: row.name,
    type: row.type as CategoryType,
    icon: row.icon,
    color: row.color,
    isSystem: row.isSystem,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const DEFAULT_CATEGORIES: Array<{
  name: string
  type: CategoryType
  icon: string
  color: string
}> = [
  { name: 'Salário', type: 'income', icon: '💰', color: '#00CC88' },
  { name: 'Freelance', type: 'income', icon: '💻', color: '#00CC88' },
  { name: 'Investimentos', type: 'income', icon: '📈', color: '#00CC88' },
  { name: 'Alimentação', type: 'expense', icon: '🍽️', color: '#CC4444' },
  { name: 'Transporte', type: 'expense', icon: '🚗', color: '#CC4444' },
  { name: 'Moradia', type: 'expense', icon: '🏠', color: '#CC4444' },
  { name: 'Saúde', type: 'expense', icon: '🏥', color: '#CC4444' },
  { name: 'Lazer', type: 'expense', icon: '🎮', color: '#CC4444' },
  { name: 'Educação', type: 'expense', icon: '📚', color: '#CC4444' },
  { name: 'Outros', type: 'expense', icon: '📦', color: '#CC4444' },
  { name: 'Transferência', type: 'transfer', icon: '🔄', color: '#4488CC' },
]

export async function createDefaultCategories(
  db: Database,
  userId: string
): Promise<void> {
  await db
    .insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((cat) => ({
        userId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      }))
    )
    .onConflictDoNothing()
}

export async function createCategory(
  db: Database,
  userId: string,
  input: CreateCategoryInput
): Promise<CategoryResponse> {
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, input.type),
        sql`LOWER(${categories.name}) = LOWER(${input.name})`
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw conflict(
      `Já existe uma categoria "${input.name}" do tipo "${input.type}"`
    )
  }

  const [created] = await db
    .insert(categories)
    .values({
      userId,
      name: input.name,
      type: input.type,
      icon: input.icon ?? null,
      color: input.color ?? null,
    })
    .returning()

  return toResponse(created)
}

export async function listCategories(
  db: Database,
  userId: string,
  query: ListCategoriesQuery
): Promise<{ data: CategoryResponse[]; total: number }> {
  const conditions: SQL[] = [eq(categories.userId, userId)]

  if (!query.includeArchived) {
    conditions.push(eq(categories.isArchived, false))
  }

  if (query.type) {
    conditions.push(eq(categories.type, query.type))
  }

  if (query.search) {
    conditions.push(ilike(categories.name, `%${query.search}%`))
  }

  const where = and(...conditions)

  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(categories)
    .where(where)

  const rows = await db
    .select()
    .from(categories)
    .where(where)
    .orderBy(categories.type, categories.name)
    .limit(query.limit)
    .offset(query.offset)

  return {
    data: rows.map(toResponse),
    total: count,
  }
}

export async function getCategoryById(
  db: Database,
  userId: string,
  categoryId: string
): Promise<CategoryResponse> {
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1)

  if (!row) {
    throw notFound('Categoria')
  }

  return toResponse(row)
}

export async function updateCategory(
  db: Database,
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput
): Promise<CategoryResponse> {
  const category = await getCategoryById(db, userId, categoryId)

  if (input.name && input.name.toLowerCase() !== category.name.toLowerCase()) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.type, category.type),
          sql`LOWER(${categories.name}) = LOWER(${input.name})`,
          sql`${categories.id} != ${categoryId}`
        )
      )
      .limit(1)

    if (existing.length > 0) {
      throw conflict(
        `Já existe uma categoria "${input.name}" do tipo "${category.type}"`
      )
    }
  }

  const [updated] = await db
    .update(categories)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
    })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function archiveCategory(
  db: Database,
  userId: string,
  categoryId: string
): Promise<CategoryResponse> {
  const category = await getCategoryById(db, userId, categoryId)

  if (category.isArchived) {
    throw badRequest('Categoria já está arquivada')
  }

  const [updated] = await db
    .update(categories)
    .set({ isArchived: true })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function unarchiveCategory(
  db: Database,
  userId: string,
  categoryId: string
): Promise<CategoryResponse> {
  const category = await getCategoryById(db, userId, categoryId)

  if (!category.isArchived) {
    throw badRequest('Categoria não está arquivada')
  }

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.userId, userId),
        eq(categories.type, category.type),
        eq(categories.isArchived, false),
        sql`LOWER(${categories.name}) = LOWER(${category.name})`
      )
    )
    .limit(1)

  if (existing.length > 0) {
    throw conflict(
      `Já existe uma categoria ativa "${category.name}" do tipo "${category.type}"`
    )
  }

  const [updated] = await db
    .update(categories)
    .set({ isArchived: false })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .returning()

  return toResponse(updated)
}

export async function deleteCategory(
  db: Database,
  userId: string,
  categoryId: string
): Promise<void> {
  const category = await getCategoryById(db, userId, categoryId)

  if (!category.isArchived) {
    throw badRequest(
      'Categoria precisa estar arquivada antes de ser deletada permanentemente'
    )
  }

  try {
    await db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
  } catch (err) {
    const pgErr = err as { code?: string }
    if (pgErr.code === '23503') {
      throw conflict(
        'Não é possível deletar: existem transações vinculadas a esta categoria'
      )
    }
    throw err
  }
}
