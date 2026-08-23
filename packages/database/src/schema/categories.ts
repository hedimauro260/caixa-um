import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const categories = pgTable(
  "categories",
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

    parentId: uuid("parent_id").references((): any => categories.id, {
      onDelete: "restrict",
    }),

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
    index("categories_user_id_idx").on(table.userId),

    uniqueIndex("categories_user_normalized_name_unique")
      .on(table.userId, sql`lower(trim(${table.name}))`)
      .where(sql`${table.deletedAt} IS NULL`),

    check("categories_name_not_blank", sql`char_length(trim(${table.name})) >= 1`),
  ],
);
