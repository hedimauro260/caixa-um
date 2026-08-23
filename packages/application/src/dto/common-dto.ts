import type { CurrencyCode } from "@caixa-1/domain";

export interface MoneyOutput {
  readonly amount: string;
  readonly currency: CurrencyCode;
}

export interface PaginationInput {
  readonly page?: number;
  readonly limit?: number;
}
