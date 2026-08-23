import { sql } from "drizzle-orm";
import { check, date, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { categories } from "./categories";
import { users } from "./users";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),

    description: varchar("description", {
      length: 200,
    }).notNull(),

    date: date("date").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("transactions_user_id_idx").on(table.userId),

    index("transactions_category_id_idx").on(table.categoryId),

    index("transactions_date_idx").on(table.date),

    check("transactions_description_min_length", sql`char_length(trim(${table.description})) >= 3`),
  ],
);
