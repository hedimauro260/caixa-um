import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { config } from "@caixa-1/config";

export async function setupRateLimit(app: FastifyInstance): Promise<void> {
  const isDev = config.server.env === "development";

  await app.register(rateLimit, {
    max: isDev ? 1000 : 100,
    timeWindow: "1 minute",
    keyGenerator: (request) => request.ip,
    errorResponseBuilder: (_request, context) => ({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: `Rate limit excedido. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
      },
    }),
  });
}
