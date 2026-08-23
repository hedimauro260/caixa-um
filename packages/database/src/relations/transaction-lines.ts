import { relations } from "drizzle-orm";
import { accounts } from "../schema/accounts";
import { transactionLines } from "../schema/transaction-lines";
import { transactions } from "../schema/transactions";

export const transactionLinesRelations = relations(transactionLines, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionLines.transactionId],
    references: [transactions.id],
  }),

  account: one(accounts, {
    fields: [transactionLines.accountId],
    references: [accounts.id],
  }),
}));
