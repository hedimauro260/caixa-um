import type { AccountType } from "../types/account-type.js";
import type { AccountId } from "../types/ids.js";
import type { CurrencyCode } from "../types/currency.js";
import type { Money } from "../money/money.js";
import { createMoney, isNegative, isZero } from "../money/money.js";
import {
  AccountNameRequired,
  AccountInvalidName,
  AccountInvalidInitialBalance,
  AccountAlreadyArchived,
  AccountAlreadyActive,
} from "../errors/account-errors.js";

export interface Account {
  readonly id: AccountId;
  readonly userId: string;
  readonly name: string;
  readonly type: AccountType;
  readonly initialBalance: Money;
  readonly description: string | null;
  readonly color: string | null;
  readonly icon: string | null;
  readonly isActive: boolean;
  readonly includeInTotal: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new AccountNameRequired();
  }
  if (name.trim().length > 50) {
    throw new AccountInvalidName(name);
  }
}

function validateInitialBalance(type: AccountType, balance: Money): void {
  if (type === "CASH" && isNegative(balance)) {
    throw new AccountInvalidInitialBalance(type, balance.amount);
  }
}

export interface CreateAccountInput {
  id: AccountId;
  userId: string;
  name: string;
  type: AccountType;
  initialBalance: string;
  currency: CurrencyCode;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  includeInTotal?: boolean;
}

export function createAccount(input: CreateAccountInput): Account {
  validateName(input.name);

  const initialBalance = createMoney(input.initialBalance, input.currency);
  validateInitialBalance(input.type, initialBalance);

  const now = new Date();

  return {
    id: input.id,
    userId: input.userId,
    name: input.name.trim(),
    type: input.type,
    initialBalance,
    description: input.description ?? null,
    color: input.color ?? null,
    icon: input.icon ?? null,
    isActive: true,
    includeInTotal: input.includeInTotal ?? true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function renameAccount(account: Account, newName: string): Account {
  validateName(newName);

  return {
    ...account,
    name: newName.trim(),
    updatedAt: new Date(),
  };
}

export function archiveAccount(account: Account): Account {
  if (!account.isActive) {
    throw new AccountAlreadyArchived();
  }

  return {
    ...account,
    isActive: false,
    updatedAt: new Date(),
  };
}

export function reactivateAccount(account: Account): Account {
  if (account.isActive) {
    throw new AccountAlreadyActive();
  }

  if (account.deletedAt !== null) {
    throw new AccountAlreadyActive();
  }

  return {
    ...account,
    isActive: true,
    updatedAt: new Date(),
  };
}

export function deleteAccount(account: Account): Account {
  return {
    ...account,
    isActive: false,
    deletedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function updateAccountIncludeInTotal(
  account: Account,
  includeInTotal: boolean,
): Account {
  return {
    ...account,
    includeInTotal,
    updatedAt: new Date(),
  };
}
