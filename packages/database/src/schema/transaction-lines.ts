import { sql } from "drizzle-orm";
import { check, index, numeric, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { accounts } from "./accounts";
import { directionType } from "./enums";
import { transactions } from "./transactions";

export const transactionLines = pgTable(
  "transaction_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, {
        onDelete: "restrict",
      }),

    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, {
        onDelete: "restrict",
      }),

    direction: directionType("direction").notNull(),

    amount: numeric("amount", {
      precision: 15,
      scale: 2,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("transaction_lines_transaction_id_idx").on(table.transactionId),

    index("transaction_lines_account_id_idx").on(table.accountId),

    check("transaction_lines_amount_positive", sql`${table.amount} > 0`),
  ],
);
