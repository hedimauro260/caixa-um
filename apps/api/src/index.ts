import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Bindings } from './bindings'
import { healthRoute } from './routes/health'

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
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

app.route('/health', healthRoute)

export default app
