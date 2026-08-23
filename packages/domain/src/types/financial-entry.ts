import type { Money } from "../money/money.js";
import type { TransactionDirection } from "./transaction-direction.js";
import type { AccountId } from "./ids.js";
import type { EconomicDate } from "./economic-date.js";

export interface FinancialEntry {
  readonly id: string;
  readonly accountId: AccountId;
  readonly direction: TransactionDirection;
  readonly amount: Money;
  readonly date: EconomicDate;
  readonly createdAt: Date;
}
