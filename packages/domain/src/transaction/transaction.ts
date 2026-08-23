import type { TransactionType } from "../types/transaction-type.js";
import type { TransactionId, AccountId, CategoryId } from "../types/ids.js";
import type { EconomicDate } from "../types/economic-date.js";
import type { TransactionLine } from "./transaction-line.js";
import type { CurrencyCode } from "../types/currency.js";
import { createMoney, compare as compareMoney } from "../money/money.js";
import { createTransactionLine } from "./transaction-line.js";
import { createTransactionLineId } from "../types/ids.js";
import {
  TransactionDescriptionRequired,
  TransactionInvalidDescription,
  TransactionDateRequired,
  TransactionLinesCannotBeEmpty,
  TransactionLineMustBeCredit,
  TransactionLineMustBeDebit,
  SameAccountTransferError,
  TransferAmountsMustBeEqual,
  TransactionCategoryCannotBeUsedWithTransfer,
  TransactionAlreadyDeleted,
  TransactionCannotChangeType,
} from "../errors/transaction-errors.js";

export interface Transaction {
  readonly id: TransactionId;
  readonly userId: string;
  readonly type: TransactionType;
  readonly categoryId: CategoryId | null;
  readonly description: string;
  readonly date: EconomicDate;
  readonly lines: readonly TransactionLine[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

function validateDescription(description: string): void {
  if (!description || description.trim().length === 0) {
    throw new TransactionDescriptionRequired();
  }
  if (description.trim().length < 3 || description.trim().length > 200) {
    throw new TransactionInvalidDescription(description);
  }
}

function validateDate(date: EconomicDate | null): asserts date is EconomicDate {
  if (!date) {
    throw new TransactionDateRequired();
  }
}

function validateLinesNotDeleted(transaction: Transaction): void {
  if (transaction.deletedAt !== null) {
    throw new TransactionAlreadyDeleted();
  }
}

interface BaseTransactionInput {
  id: TransactionId;
  userId: string;
  description: string;
  date: EconomicDate;
}

interface SingleAccountInput extends BaseTransactionInput {
  accountId: AccountId;
  amount: string;
  currency: CurrencyCode;
  categoryId?: CategoryId | null;
}

interface TransferInput extends BaseTransactionInput {
  originAccountId: AccountId;
  destinationAccountId: AccountId;
  amount: string;
  currency: CurrencyCode;
}

export function createIncome(input: SingleAccountInput): Transaction {
  validateDescription(input.description);
  validateDate(input.date);

  const amount = createMoney(input.amount, input.currency);
  const creditLine = createTransactionLine({
    id: createTransactionLineId(crypto.randomUUID()),
    accountId: input.accountId,
    direction: "CREDIT",
    amount,
  });

  const now = new Date();

  return {
    id: input.id,
    userId: input.userId,
    type: "INCOME",
    categoryId: input.categoryId ?? null,
    description: input.description.trim(),
    date: input.date,
    lines: [creditLine],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function createExpense(input: SingleAccountInput): Transaction {
  validateDescription(input.description);
  validateDate(input.date);

  const amount = createMoney(input.amount, input.currency);
  const debitLine = createTransactionLine({
    id: createTransactionLineId(crypto.randomUUID()),
    accountId: input.accountId,
    direction: "DEBIT",
    amount,
  });

  const now = new Date();

  return {
    id: input.id,
    userId: input.userId,
    type: "EXPENSE",
    categoryId: input.categoryId ?? null,
    description: input.description.trim(),
    date: input.date,
    lines: [debitLine],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function createTransfer(input: TransferInput): Transaction {
  validateDescription(input.description);
  validateDate(input.date);

  if (input.originAccountId === input.destinationAccountId) {
    throw new SameAccountTransferError();
  }

  const amount = createMoney(input.amount, input.currency);

  const debitLine = createTransactionLine({
    id: createTransactionLineId(crypto.randomUUID()),
    accountId: input.originAccountId,
    direction: "DEBIT",
    amount,
  });

  const creditLine = createTransactionLine({
    id: createTransactionLineId(crypto.randomUUID()),
    accountId: input.destinationAccountId,
    direction: "CREDIT",
    amount,
  });

  const now = new Date();

  return {
    id: input.id,
    userId: input.userId,
    type: "TRANSFER",
    categoryId: null,
    description: input.description.trim(),
    date: input.date,
    lines: [debitLine, creditLine],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function updateTransactionDescription(
  transaction: Transaction,
  newDescription: string,
): Transaction {
  validateDescription(newDescription);
  validateLinesNotDeleted(transaction);

  return {
    ...transaction,
    description: newDescription.trim(),
    updatedAt: new Date(),
  };
}

export function updateTransactionDate(
  transaction: Transaction,
  newDate: EconomicDate,
): Transaction {
  validateLinesNotDeleted(transaction);

  return {
    ...transaction,
    date: newDate,
    updatedAt: new Date(),
  };
}

export function softDeleteTransaction(transaction: Transaction): Transaction {
  validateLinesNotDeleted(transaction);

  return {
    ...transaction,
    deletedAt: new Date(),
    updatedAt: new Date(),
  };
}
