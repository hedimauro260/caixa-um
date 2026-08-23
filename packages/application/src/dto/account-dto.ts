import type { AccountTypeValue, CurrencyCode } from "@caixa-1/domain";
import type { MoneyOutput } from "./common-dto.js";

export interface CreateAccountInput {
  readonly name: string;
  readonly type: AccountTypeValue;
  readonly initialBalance: string;
  readonly currency: CurrencyCode;
  readonly description?: string | null;
  readonly color?: string | null;
  readonly icon?: string | null;
  readonly includeInTotal?: boolean;
}

export interface UpdateAccountInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly color?: string | null;
  readonly icon?: string | null;
  readonly includeInTotal?: boolean;
}

export interface AccountOutput {
  readonly id: string;
  readonly name: string;
  readonly type: AccountTypeValue;
  readonly initialBalance: MoneyOutput;
  readonly description: string | null;
  readonly color: string | null;
  readonly icon: string | null;
  readonly isActive: boolean;
  readonly includeInTotal: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
