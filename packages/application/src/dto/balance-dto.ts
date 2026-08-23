import type { MoneyOutput } from "./common-dto.js";

export interface BalanceViolationOutput {
  readonly accountId: string;
  readonly balanceAtViolation: MoneyOutput;
}

export interface BalanceOutput {
  readonly finalBalance: MoneyOutput;
  readonly valid: boolean;
  readonly firstViolation: BalanceViolationOutput | null;
}
