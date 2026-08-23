import type { FastifyInstance } from "fastify";
import { container } from "../container.js";
import { journalQuerySchema } from "../schemas/index.js";

export async function journalRoutes(app: FastifyInstance): Promise<void> {
  app.get("/", async (request, reply) => {
    const query = journalQuerySchema.parse(request.query);
    const result = await container.useCases.getJournal.execute(
      request.context,
      query,
    );
    return reply.send(result);
  });
}
