import { accounts } from "../schema/accounts";
import type {
  Account,
  AccountType,
  CurrencyCode,
} from "@caixa-1/domain";
import { createMoney } from "@caixa-1/domain";

type AccountRow = typeof accounts.$inferSelect;

export function toAccountDomain(row: AccountRow): Account {
  return {
    id: row.id as Account["id"],
    userId: row.userId,
    name: row.name,
    type: row.type as AccountType,
    initialBalance: createMoney(
      row.initialBalance,
      row.currency as CurrencyCode,
    ),
    description: row.description,
    color: row.color,
    icon: row.icon,
    isActive: row.isActive,
    includeInTotal: row.includeInTotal,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export function toAccountPersistence(account: Account) {
  return {
    id: account.id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    initialBalance: account.initialBalance.amount,
    currency: account.initialBalance.currency,
    description: account.description,
    color: account.color,
    icon: account.icon,
    isActive: account.isActive,
    includeInTotal: account.includeInTotal,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    deletedAt: account.deletedAt,
  };
}
