import type { FastifyInstance } from "fastify";
import { container } from "../container.js";
import {
  createAccountSchema,
  updateAccountSchema,
  idParamSchema,
} from "../schemas/index.js";

export async function accountRoutes(app: FastifyInstance): Promise<void> {
  app.post("/", async (request, reply) => {
    const body = createAccountSchema.parse(request.body);
    const result = await container.useCases.createAccount.execute(
      request.context,
      body,
    );
    return reply.status(201).send(result);
  });

  app.get("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.getAccount.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateAccountSchema.parse(request.body);
    const result = await container.useCases.renameAccount.execute(
      request.context,
      id,
      body,
    );
    return reply.send(result);
  });

  app.post("/:id/archive", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.archiveAccount.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.post("/:id/reactivate", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.reactivateAccount.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.deleteAccount.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });
}
