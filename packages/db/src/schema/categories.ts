import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    icon: text("icon"),
    color: text("color"),
    isSystem: boolean("is_system").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("categories_user_id_idx").on(table.userId),
    userTypeIdx: index("categories_user_type_idx").on(table.userId, table.type),
    uniqueNamePerUser: uniqueIndex("categories_unique_name_per_user").on(
      table.userId,
      table.name,
      table.type,
    ),
  }),
)

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
