import { relations } from "drizzle-orm";
import { accounts } from "../schema/accounts";
import { categories } from "../schema/categories";
import { transactions } from "../schema/transactions";
import { users } from "../schema/users";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
}));
