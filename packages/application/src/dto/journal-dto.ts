import type { TransactionTypeValue } from "@caixa-1/domain";
import type { PaginationInput } from "./common-dto.js";
import type { TransactionOutput } from "./transaction-dto.js";

export interface JournalInput extends PaginationInput {
  readonly accountId?: string;
  readonly categoryId?: string;
  readonly type?: TransactionTypeValue;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

export interface JournalOutput {
  readonly transactions: readonly TransactionOutput[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}
