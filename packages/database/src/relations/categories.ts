import { relations } from "drizzle-orm";
import { categories } from "../schema/categories";
import { transactions } from "../schema/transactions";

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryHierarchy",
  }),

  children: many(categories, {
    relationName: "categoryHierarchy",
  }),

  transactions: many(transactions),
}));
