import { createDb, type Database } from '@caixa1/db'
import type { Bindings } from '../bindings'

export function createDbFromBindings(env: Bindings): Database {
  return createDb(env.DATABASE_URL)
}
