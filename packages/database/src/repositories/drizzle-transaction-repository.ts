import { eq, and, isNull, lte, gte, inArray, count } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { transactions } from "../schema/transactions";
import { transactionLines } from "../schema/transaction-lines";
import {
  toTransactionDomain,
  toTransactionPersistence,
  toFinancialEntry,
} from "../mappers/transaction-mapper";
import type { TransactionRepository, TransactionFilters } from "@caixa-1/application";
import type { Transaction, EconomicDate, FinancialEntry } from "@caixa-1/domain";

export class DrizzleTransactionRepository implements TransactionRepository {
  private readonly db: typeof defaultDb;

  constructor(dbInstance?: typeof defaultDb) {
    this.db = dbInstance ?? defaultDb;
  }

  async findById(
    transactionId: string,
    userId: string,
  ): Promise<Transaction | null> {
    const [txRow] = await this.db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
        ),
      )
      .limit(1);

    if (!txRow) return null;

    const lineRows = await this.db
      .select()
      .from(transactionLines)
      .where(eq(transactionLines.transactionId, txRow.id));

    return toTransactionDomain(txRow, lineRows);
  }

  async findByAccountUntilDate(
    accountId: string,
    userId: string,
    date: EconomicDate,
  ): Promise<FinancialEntry[]> {
    const lineRows = await this.db
      .select({
        id: transactionLines.id,
        accountId: transactionLines.accountId,
        direction: transactionLines.direction,
        amount: transactionLines.amount,
        createdAt: transactionLines.createdAt,
        transactionDate: transactions.date,
      })
      .from(transactionLines)
      .innerJoin(
        transactions,
        eq(transactionLines.transactionId, transactions.id),
      )
      .where(
        and(
          eq(transactionLines.accountId, accountId),
          eq(transactions.userId, userId),
          lte(transactions.date, date),
          isNull(transactions.deletedAt),
        ),
      )
      .orderBy(transactions.date, transactions.createdAt, transactions.id);

    return lineRows.map((row) =>
      toFinancialEntry({
        id: row.id,
        accountId: row.accountId,
        direction: row.direction,
        amount: row.amount,
        createdAt: row.createdAt,
        transactionDate: row.transactionDate,
      }),
    );
  }

  async findByAccountIds(
    accountIds: string[],
    userId: string,
    date?: EconomicDate,
  ): Promise<FinancialEntry[]> {
    if (accountIds.length === 0) return [];

    const conditions = [
      inArray(transactionLines.accountId, accountIds),
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
    ];

    if (date) {
      conditions.push(lte(transactions.date, date));
    }

    const lineRows = await this.db
      .select({
        id: transactionLines.id,
        accountId: transactionLines.accountId,
        direction: transactionLines.direction,
        amount: transactionLines.amount,
        createdAt: transactionLines.createdAt,
        transactionDate: transactions.date,
      })
      .from(transactionLines)
      .innerJoin(
        transactions,
        eq(transactionLines.transactionId, transactions.id),
      )
      .where(and(...conditions))
      .orderBy(transactions.date, transactions.createdAt, transactions.id);

    return lineRows.map((row) =>
      toFinancialEntry({
        id: row.id,
        accountId: row.accountId,
        direction: row.direction,
        amount: row.amount,
        createdAt: row.createdAt,
        transactionDate: row.transactionDate,
      }),
    );
  }

  async findMany(
    userId: string,
    filters: TransactionFilters,
    pagination: { offset: number; limit: number },
  ): Promise<Transaction[]> {
    const conditions = [
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
    ];

    if (filters.accountId) {
      const subQuery = this.db
        .select({ transactionId: transactionLines.transactionId })
        .from(transactionLines)
        .where(eq(transactionLines.accountId, filters.accountId));

      conditions.push(inArray(transactions.id, subQuery));
    }

    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }

    if (filters.dateFrom) {
      conditions.push(gte(transactions.date, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(transactions.date, filters.dateTo));
    }

    const txRows = await this.db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(transactions.date, transactions.createdAt, transactions.id)
      .limit(pagination.limit)
      .offset(pagination.offset);

    if (txRows.length === 0) return [];

    const txIds = txRows.map((tx) => tx.id);
    const allLineRows = await this.db
      .select()
      .from(transactionLines)
      .where(inArray(transactionLines.transactionId, txIds));

    const linesByTx = new Map<string, typeof allLineRows>();
    for (const line of allLineRows) {
      const list = linesByTx.get(line.transactionId) ?? [];
      list.push(line);
      linesByTx.set(line.transactionId, list);
    }

    return txRows.map((txRow) =>
      toTransactionDomain(txRow, linesByTx.get(txRow.id) ?? []),
    );
  }

  async countByFilters(
    userId: string,
    filters: TransactionFilters,
  ): Promise<number> {
    const conditions = [
      eq(transactions.userId, userId),
      isNull(transactions.deletedAt),
    ];

    if (filters.accountId) {
      const subQuery = this.db
        .select({ transactionId: transactionLines.transactionId })
        .from(transactionLines)
        .where(eq(transactionLines.accountId, filters.accountId));

      conditions.push(inArray(transactions.id, subQuery));
    }

    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }

    if (filters.dateFrom) {
      conditions.push(gte(transactions.date, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(transactions.date, filters.dateTo));
    }

    const [result] = await this.db
      .select({ value: count() })
      .from(transactions)
      .where(and(...conditions));

    return result?.value ?? 0;
  }

  async save(transaction: Transaction): Promise<void> {
    const { tx, lines } = toTransactionPersistence(transaction);

    await this.db.insert(transactions).values(tx);

    for (const line of lines) {
      await this.db.insert(transactionLines).values(line);
    }
  }

  async update(transaction: Transaction): Promise<void> {
    const { tx } = toTransactionPersistence(transaction);
    await this.db
      .update(transactions)
      .set({
        categoryId: tx.categoryId,
        description: tx.description,
        date: tx.date,
        updatedAt: tx.updatedAt,
        deletedAt: tx.deletedAt,
      })
      .where(eq(transactions.id, tx.id));
  }

  async softDelete(transactionId: string, userId: string): Promise<void> {
    await this.db
      .update(transactions)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, userId),
        ),
      );
  }
}
