import type { ApplicationContext } from "../../context.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { JournalInput, JournalOutput } from "../../dto/journal-dto.js";
import type { TransactionOutput } from "../../dto/transaction-dto.js";

export class GetJournal {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(
    context: ApplicationContext,
    input: JournalInput,
  ): Promise<JournalOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const offset = (page - 1) * limit;

    const filters = {
      accountId: input.accountId,
      categoryId: input.categoryId,
      type: input.type,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    };

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findMany(context.userId, filters, {
        offset,
        limit,
      }),
      this.transactionRepository.countByFilters(context.userId, filters),
    ]);

    const outputs: TransactionOutput[] = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      categoryId: tx.categoryId,
      description: tx.description,
      date: tx.date,
      lines: tx.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    }));

    return {
      transactions: outputs,
      total,
      page,
      limit,
    };
  }
}
