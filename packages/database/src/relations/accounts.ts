import { relations } from "drizzle-orm";
import { accounts } from "../schema/accounts";
import { transactionLines } from "../schema/transaction-lines";

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactionLines: many(transactionLines),
}));
