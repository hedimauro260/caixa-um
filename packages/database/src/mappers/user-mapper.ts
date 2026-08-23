import { users } from "../schema/users";
import type { User, CurrencyCode } from "@caixa-1/domain";

type UserRow = typeof users.$inferSelect;

export function toUserDomain(row: UserRow): User {
  return {
    id: row.id as User["id"],
    clerkId: row.clerkId,
    email: row.email,
    name: row.name,
    baseCurrency: row.baseCurrency as CurrencyCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export function toUserPersistence(user: User) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    baseCurrency: user.baseCurrency,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}
