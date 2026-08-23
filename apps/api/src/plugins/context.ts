import type { FastifyInstance } from "fastify";
import type { ApplicationContext } from "@caixa-1/application";
import { createEconomicDate } from "@caixa-1/domain";

declare module "fastify" {
  interface FastifyRequest {
    context: ApplicationContext;
  }
}

export async function setupContext(app: FastifyInstance): Promise<void> {
  app.decorateRequest("context", undefined as unknown as ApplicationContext);

  app.addHook("onRequest", async (request) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    request.context = {
      userId: "authenticated-user-id",
      today: createEconomicDate(todayStr),
    };
  });
}
