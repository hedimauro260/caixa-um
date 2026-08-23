import Fastify from "fastify";
import { config } from "@caixa-1/config";
import { setupCors } from "./plugins/cors.js";
import { setupErrorHandler } from "./plugins/error-handler.js";
import { setupAuth } from "./plugins/auth.js";
import { setupRateLimit } from "./plugins/rate-limit.js";
import { setupRequestLogging } from "./plugins/request-logging.js";
import { setupHealthCheck } from "./plugins/health-check.js";
import { setupSwagger } from "./plugins/swagger.js";
import {
  accountRoutes,
  categoryRoutes,
  transactionRoutes,
  balanceRoutes,
  journalRoutes,
} from "./routes/index.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
    trustProxy: config.server.trustProxy,
  });

  await setupCors(app);
  setupErrorHandler(app);
  await setupRateLimit(app);
  setupRequestLogging(app);
  await setupAuth(app);
  await setupHealthCheck(app);
  await setupSwagger(app);

  app.register(accountRoutes, { prefix: "/api/accounts" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(transactionRoutes, { prefix: "/api/transactions" });
  app.register(balanceRoutes, { prefix: "/api/balances" });
  app.register(journalRoutes, { prefix: "/api/journal" });

  return app;
}
