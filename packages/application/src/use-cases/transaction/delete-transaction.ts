import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import { softDeleteTransaction } from "@caixa-1/domain";
import { TransactionNotFound } from "@caixa-1/domain";

export class DeleteTransaction {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    transactionId: string,
  ): Promise<{ success: true }> {
    await this.unitOfWork.execute(async (repos) => {
      const transactionRepo = repos.transactionRepository as TransactionRepository;

      const transaction = await transactionRepo.findById(
        transactionId,
        context.userId,
      );
      if (!transaction) {
        throw new TransactionNotFound(transactionId);
      }

      const deleted = softDeleteTransaction(transaction);
      await transactionRepo.update(deleted);
    });

    return { success: true };
  }
}
