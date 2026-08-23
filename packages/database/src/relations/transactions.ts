import { relations } from "drizzle-orm";
import { transactionLines } from "../schema/transaction-lines";
import { transactions } from "../schema/transactions";

export const transactionsRelations = relations(transactions, ({ many }) => ({
  transactionLines: many(transactionLines),
}));
