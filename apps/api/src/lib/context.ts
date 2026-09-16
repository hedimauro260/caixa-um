import type { Database } from '@caixa1/db'
import type { Bindings } from '../bindings'

export interface Variables {
  userId: string
  db: Database
  requestId: string
}

export type AppContext = {
  Bindings: Bindings
  Variables: Variables
}
