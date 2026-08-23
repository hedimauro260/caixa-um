import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  numeric,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { accountType } from "./enums";
import { users } from "./users";

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),

    name: varchar("name", {
      length: 50,
    }).notNull(),

    type: accountType("type").notNull(),

    initialBalance: numeric("initial_balance", {
      precision: 15,
      scale: 2,
    })
      .notNull()
      .default("0"),

    currency: varchar("currency", {
      length: 3,
    }).notNull(),

    description: varchar("description", {
      length: 200,
    }),

    color: varchar("color", {
      length: 7,
    }),

    icon: varchar("icon", {
      length: 10,
    }),

    isActive: boolean("is_active").notNull().default(true),

    includeInTotal: boolean("include_in_total").notNull().default(true),

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
    index("accounts_user_id_idx").on(table.userId),

    uniqueIndex("accounts_user_normalized_name_unique")
      .on(table.userId, sql`lower(trim(${table.name}))`)
      .where(sql`${table.deletedAt} IS NULL`),

    check("accounts_name_not_blank", sql`char_length(trim(${table.name})) >= 1`),

    check(
      "accounts_cash_initial_balance_non_negative",
      sql`${table.type} <> 'CASH' OR ${table.initialBalance} >= 0`,
    ),
  ],
);
