import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "@caixa-1/database";

export async function setupHealthCheck(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    try {
      await db.execute(sql`SELECT 1`);
      return reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    } catch {
      return reply.status(503).send({
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      });
    }
  });
}
