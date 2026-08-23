import cors from "@fastify/cors";
import type { FastifyInstance } from "fastify";
import { config } from "@caixa-1/config";

export async function setupCors(app: FastifyInstance): Promise<void> {
  const origins =
    config.server.env === "production"
      ? ["https://caixa1.com"]
      : ["http://localhost:5173", "http://localhost:3000"];

  await app.register(cors, {
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}
