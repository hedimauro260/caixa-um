import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    balance: decimal("balance", { precision: 14, scale: 2 })
      .default("0")
      .notNull(),
    currency: text("currency").default("BRL").notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("accounts_user_id_idx").on(table.userId),
    archivedIdx: index("accounts_archived_idx").on(table.isArchived),
  }),
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
