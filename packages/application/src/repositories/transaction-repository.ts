import type { Transaction, FinancialEntry, EconomicDate } from "@caixa-1/domain";
import type { TransactionTypeValue } from "@caixa-1/domain";

export interface TransactionFilters {
  readonly accountId?: string;
  readonly categoryId?: string;
  readonly type?: TransactionTypeValue;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface TransactionRepository {
  findById(transactionId: string, userId: string): Promise<Transaction | null>;
  findByAccountUntilDate(
    accountId: string,
    userId: string,
    date: EconomicDate,
  ): Promise<FinancialEntry[]>;
  findByAccountIds(
    accountIds: string[],
    userId: string,
    date?: EconomicDate,
  ): Promise<FinancialEntry[]>;
  findMany(
    userId: string,
    filters: TransactionFilters,
    pagination: { offset: number; limit: number },
  ): Promise<Transaction[]>;
  countByFilters(userId: string, filters: TransactionFilters): Promise<number>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  softDelete(transactionId: string, userId: string): Promise<void>;
}
