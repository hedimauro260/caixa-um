import { transactions } from "../schema/transactions";
import { transactionLines } from "../schema/transaction-lines";
import type {
  Transaction,
  TransactionLine,
  TransactionType,
  FinancialEntry,
  EconomicDate,
} from "@caixa-1/domain";
import { createMoney } from "@caixa-1/domain";

type TransactionRow = typeof transactions.$inferSelect;
type TransactionLineRow = typeof transactionLines.$inferSelect;

export function toTransactionLineDomain(row: TransactionLineRow): TransactionLine {
  return {
    id: row.id as TransactionLine["id"],
    accountId: row.accountId as TransactionLine["accountId"],
    direction: row.direction as TransactionLine["direction"],
    amount: createMoney(row.amount, "AOA"), // MVP: mono-currency (AOA). Future: fetch currency from accounts table
  };
}

export function toTransactionDomain(
  txRow: TransactionRow,
  lineRows: TransactionLineRow[],
): Transaction {
  const lines = lineRows.map(toTransactionLineDomain);

  return {
    id: txRow.id as Transaction["id"],
    userId: txRow.userId,
    type: (lines.length === 1
      ? lines[0].direction === "CREDIT"
        ? "INCOME"
        : "EXPENSE"
      : "TRANSFER") as TransactionType,
    categoryId: (txRow.categoryId ?? null) as Transaction["categoryId"],
    description: txRow.description,
    date: txRow.date as EconomicDate,
    lines,
    createdAt: txRow.createdAt,
    updatedAt: txRow.updatedAt,
    deletedAt: txRow.deletedAt,
  };
}

export function toTransactionPersistence(transaction: Transaction) {
  return {
    tx: {
      id: transaction.id,
      userId: transaction.userId,
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deletedAt: transaction.deletedAt,
    },
    lines: transaction.lines.map((line) => ({
      id: line.id,
      transactionId: transaction.id,
      accountId: line.accountId,
      direction: line.direction,
      amount: line.amount.amount,
      createdAt: transaction.createdAt,
    })),
  };
}

export function toFinancialEntry(row: {
  id: string;
  accountId: string;
  direction: string;
  amount: string;
  transactionDate: string;
  createdAt: Date;
}): FinancialEntry {
  return {
    id: row.id,
    accountId: row.accountId as FinancialEntry["accountId"],
    direction: row.direction as FinancialEntry["direction"],
    amount: createMoney(row.amount, "AOA"), // MVP: mono-currency (AOA). Future: fetch currency from accounts table
    date: row.transactionDate as EconomicDate,
    createdAt: row.createdAt,
  };
}
