import type { FastifyInstance } from "fastify";
import { container } from "../container.js";
import {
  createIncomeSchema,
  createExpenseSchema,
  createTransferSchema,
  updateTransactionSchema,
  idParamSchema,
} from "../schemas/index.js";

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.post("/income", async (request, reply) => {
    const body = createIncomeSchema.parse(request.body);
    const result = await container.useCases.createTransaction.executeIncome(
      request.context,
      body,
    );
    return reply.status(201).send(result);
  });

  app.post("/expense", async (request, reply) => {
    const body = createExpenseSchema.parse(request.body);
    const result = await container.useCases.createTransaction.executeExpense(
      request.context,
      body,
    );
    return reply.status(201).send(result);
  });

  app.post("/transfer", async (request, reply) => {
    const body = createTransferSchema.parse(request.body);
    const result = await container.useCases.createTransaction.executeTransfer(
      request.context,
      body,
    );
    return reply.status(201).send(result);
  });

  app.get("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.getTransaction.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });

  app.patch("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = updateTransactionSchema.parse(request.body);
    const result = await container.useCases.updateTransaction.execute(
      request.context,
      id,
      body,
    );
    return reply.send(result);
  });

  app.delete("/:id", async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    const result = await container.useCases.deleteTransaction.execute(
      request.context,
      id,
    );
    return reply.send(result);
  });
}
