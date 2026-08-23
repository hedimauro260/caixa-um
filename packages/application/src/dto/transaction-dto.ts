import type {
  CurrencyCode,
  TransactionTypeValue,
  TransactionDirectionValue,
} from "@caixa-1/domain";
import type { MoneyOutput } from "./common-dto.js";

export interface CreateIncomeInput {
  readonly accountId: string;
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly categoryId?: string | null;
  readonly description: string;
  readonly date: string;
}

export interface CreateExpenseInput {
  readonly accountId: string;
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly categoryId?: string | null;
  readonly description: string;
  readonly date: string;
}

export interface CreateTransferInput {
  readonly originAccountId: string;
  readonly destinationAccountId: string;
  readonly amount: string;
  readonly currency: CurrencyCode;
  readonly description: string;
  readonly date: string;
}

export interface UpdateTransactionInput {
  readonly description?: string;
  readonly date?: string;
  readonly categoryId?: string | null;
}

export interface TransactionLineOutput {
  readonly id: string;
  readonly accountId: string;
  readonly direction: TransactionDirectionValue;
  readonly amount: MoneyOutput;
}

export interface TransactionOutput {
  readonly id: string;
  readonly type: TransactionTypeValue;
  readonly categoryId: string | null;
  readonly description: string;
  readonly date: string;
  readonly lines: readonly TransactionLineOutput[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
