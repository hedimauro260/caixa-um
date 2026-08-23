import type { AccountId, TransactionLineId } from "../types/ids.js";
import type { TransactionDirection } from "../types/transaction-direction.js";
import type { Money } from "../money/money.js";
import { isPositive } from "../money/money.js";

export interface TransactionLine {
  readonly id: TransactionLineId;
  readonly accountId: AccountId;
  readonly direction: TransactionDirection;
  readonly amount: Money;
}

export interface CreateTransactionLineInput {
  id: TransactionLineId;
  accountId: AccountId;
  direction: TransactionDirection;
  amount: Money;
}

export function createTransactionLine(
  input: CreateTransactionLineInput,
): TransactionLine {
  if (!isPositive(input.amount)) {
    throw new Error("TransactionLine amount must be positive");
  }

  return {
    id: input.id,
    accountId: input.accountId,
    direction: input.direction,
    amount: input.amount,
  };
}
