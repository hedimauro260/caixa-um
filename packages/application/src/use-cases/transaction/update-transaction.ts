import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { UpdateTransactionInput, TransactionOutput } from "../../dto/transaction-dto.js";
import {
  updateTransactionDescription,
  updateTransactionDate,
} from "@caixa-1/domain";
import { TransactionNotFound, CategoryNotFound } from "@caixa-1/domain";
import type { EconomicDate, CategoryId } from "@caixa-1/domain";

export class UpdateTransaction {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    transactionId: string,
    input: UpdateTransactionInput,
  ): Promise<TransactionOutput> {
    const updated = await this.unitOfWork.execute(async (repos) => {
      const transactionRepo = repos.transactionRepository as TransactionRepository;
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const transaction = await transactionRepo.findById(
        transactionId,
        context.userId,
      );
      if (!transaction) {
        throw new TransactionNotFound(transactionId);
      }

      if (input.categoryId !== undefined && input.categoryId !== null) {
        const category = await categoryRepo.findById(
          input.categoryId,
          context.userId,
        );
        if (!category) {
          throw new CategoryNotFound(input.categoryId);
        }
      }

      let result = transaction;
      if (input.description !== undefined) {
        result = updateTransactionDescription(result, input.description);
      }
      if (input.date !== undefined) {
        result = updateTransactionDate(result, input.date as EconomicDate);
      }
      if (input.categoryId !== undefined) {
        result = { ...result, categoryId: input.categoryId as CategoryId | null, updatedAt: new Date() };
      }

      await transactionRepo.update(result);
      return result;
    });

    return {
      id: updated.id,
      type: updated.type,
      categoryId: updated.categoryId,
      description: updated.description,
      date: updated.date,
      lines: updated.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
