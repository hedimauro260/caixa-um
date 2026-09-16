import { eq } from 'drizzle-orm'
import { users, type Database } from '@caixa1/db'
import { createDefaultCategories } from '../services/categories'

export async function resolveUserId(
  db: Database,
  clerkId: string,
  clerkEmail?: string
): Promise<string> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1)

  if (existing.length > 0) {
    return existing[0].id
  }

  try {
    const [created] = await db
      .insert(users)
      .values({
        clerkId,
        email: clerkEmail ?? `${clerkId}@placeholder.local`,
        name: null,
      })
      .returning({ id: users.id })

    await createDefaultCategories(db, created.id)

    return created.id
  } catch (err) {
    const retry = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1)

    if (retry.length > 0) {
      return retry[0].id
    }

    throw err
  }
}
