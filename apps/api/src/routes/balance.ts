import type { FastifyInstance } from "fastify";
import { container } from "../container.js";
import {
  accountIdParamSchema,
  historicalDateParamSchema,
} from "../schemas/index.js";

export async function balanceRoutes(app: FastifyInstance): Promise<void> {
  app.get("/total", async (request, reply) => {
    const result = await container.useCases.getTotalBalance.execute(
      request.context,
    );
    return reply.send(result);
  });

  app.get("/account/:accountId", async (request, reply) => {
    const { accountId } = accountIdParamSchema.parse(request.params);
    const result = await container.useCases.getAccountBalance.execute(
      request.context,
      accountId,
    );
    return reply.send(result);
  });

  app.get("/account/:accountId/:date", async (request, reply) => {
    const params = request.params as Record<string, string>;
    const { accountId, date } = historicalDateParamSchema.parse(params);
    const result = await container.useCases.getHistoricalBalance.execute(
      request.context,
      accountId,
      date as import("@caixa-1/domain").EconomicDate,
    );
    return reply.send(result);
  });
}
