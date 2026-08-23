import type { ApplicationContext } from "../../context.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { TransactionOutput } from "../../dto/transaction-dto.js";
import { TransactionNotFound } from "@caixa-1/domain";

export class GetTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    context: ApplicationContext,
    transactionId: string,
  ): Promise<TransactionOutput> {
    const transaction = await this.transactionRepository.findById(
      transactionId,
      context.userId,
    );

    if (!transaction) {
      throw new TransactionNotFound(transactionId);
    }

    return {
      id: transaction.id,
      type: transaction.type,
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date,
      lines: transaction.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }
}
