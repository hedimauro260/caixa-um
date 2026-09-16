// ---------------------------------------------------------------------------
// caixa-um API
// ---------------------------------------------------------------------------
// Arquitetura: roteador Hono rodando no edge runtime da Cloudflare Workers.
// Cada requisição ganha uma instância curta de pool do Neon via `withDb`.
// Nenhuma conexão sobrevive entre requisições — não guardar estado no módulo.
//
// Middlewares globais (ordem importa):
//   1. requestLogger  → requestId + log de entrada/saída
//   2. errorHandler   → transforma ZodError/HTTPException em envelope JSON
//   3. cors           → origens permitidas (localhost de dev do lab/web)
//   4. withDb         → injeta `c.var.db` (Pool do Neon com as bindings)
//
// Autenticação: `requireAuth` é aplicado POR ROTA, propositalmente NÃO global.
// O único endpoint público é GET /health (liveness check — não precisa de DB
// nem de Clerk). Cada resource route aplica requireAuth no próprio handler,
// mantendo o health check aberto e o erro 401 com envelope JSON padronizado.
//
// Regras de ordenação de rotas dentro de cada router:
//   - rotas estáticas (/summary, /export) SEMPRE antes de /:id
//   - /summary antes de /:id em transactions (o Hono casa por ordem)
//   - /export antes de /:id em journal (o Hono casa por ordem)
// ---------------------------------------------------------------------------

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AppContext } from './lib/context'
import { errorHandler } from './middleware/error'
import { requestLogger } from './middleware/logger'
import { withDb } from './middleware/db'
import { healthRoute } from './routes/health'
import { accountsRoute } from './routes/accounts'
import { categoriesRoute } from './routes/categories'
import { transactionsRoute } from './routes/transactions'
import { journalRoute } from './routes/journal'

export const app = new Hono<AppContext>()

// ---------------------------------------------------------------------------
// Middlewares globais — nesta ordem.
// ---------------------------------------------------------------------------
app.use('*', requestLogger)
app.use('*', errorHandler)
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  })
)
app.use('*', withDb)

// ---------------------------------------------------------------------------
// Montagem dos routers.
// health é público; os demais exigem Bearer token (requireAuth por rota).
// ---------------------------------------------------------------------------
app.route('/health', healthRoute)
app.route('/accounts', accountsRoute)
app.route('/categories', categoriesRoute)
app.route('/transactions', transactionsRoute)
app.route('/journal', journalRoute)

export default app
