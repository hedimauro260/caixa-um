import type { FastifyInstance } from "fastify";
import { container } from "../container.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} from "../schemas/index.js";

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  app.post("/", async (request, reply) => {
    const body = createCategorySchema.parse(request.body);
    const result = await container.useCases.createCategory.execute(
      request.context,
      body,
    );
    return reply.status(201).send(result);
  });

  app.get("/tree", async (request, reply) => {
    const result = await container.useCases.listCategories.execute(
      request.context,
    );
    return reply.send(result);
  });

  app.get("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.getCategory.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateCategorySchema.parse(request.body);
    const result = await container.useCases.updateCategory.execute(
      request.context,
      id,
      body,
    );
    return reply.send(result);
  });

  app.post("/:id/archive", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.archiveCategory.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.post("/:id/reactivate", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.reactivateCategory.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.deleteCategory.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });
}
