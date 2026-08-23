import type { AccountType } from "../types/account-type.js";
import type { FinancialEntry } from "../types/financial-entry.js";
import type { EconomicDate } from "../types/economic-date.js";
import { compareEconomicDate } from "../types/economic-date.js";
import type { Money } from "../money/money.js";
import { createMoney, add, subtract, isNegative } from "../money/money.js";

export interface BalanceCalculationInput {
  readonly initialBalance: Money;
  readonly accountType: AccountType;
  readonly entries: readonly FinancialEntry[];
}

export interface FinancialViolation {
  readonly accountId: string;
  readonly balanceAtViolation: Money;
  readonly violatingEntry: FinancialEntry;
}

export interface BalanceResult {
  readonly finalBalance: Money;
  readonly valid: boolean;
  readonly firstViolation: FinancialViolation | null;
}

function sortByDateAsc(
  entries: readonly FinancialEntry[],
): readonly FinancialEntry[] {
  return [...entries].sort((a, b) => {
    const dateCompare = compareEconomicDate(a.date, b.date);
    if (dateCompare !== 0) return dateCompare;

    const createdAtCompare = a.createdAt.getTime() - b.createdAt.getTime();
    if (createdAtCompare !== 0) return createdAtCompare;

    return a.id.localeCompare(b.id);
  });
}

function applyEntry(
  current: Money,
  entry: FinancialEntry,
): Money {
  if (entry.direction === "CREDIT") {
    return add(current, entry.amount);
  }
  return subtract(current, entry.amount);
}

export function calculateBalance(
  input: BalanceCalculationInput,
): BalanceResult {
  const sorted = sortByDateAsc(input.entries);
  let current = input.initialBalance;
  let firstViolation: FinancialViolation | null = null;

  for (const entry of sorted) {
    current = applyEntry(current, entry);

    if (input.accountType === "CASH" && isNegative(current) && !firstViolation) {
      firstViolation = {
        accountId: entry.accountId,
        balanceAtViolation: current,
        violatingEntry: entry,
      };
    }
  }

  return { finalBalance: current, valid: firstViolation === null, firstViolation };
}

export function filterEntriesBeforeDate(
  entries: readonly FinancialEntry[],
  date: EconomicDate,
): readonly FinancialEntry[] {
  return entries.filter((e) => compareEconomicDate(e.date, date) <= 0);
}

export function filterActiveEntries(
  entries: readonly FinancialEntry[],
): readonly FinancialEntry[] {
  return entries;
}
