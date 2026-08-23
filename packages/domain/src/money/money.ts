import { z } from "zod";
import type { CurrencyCode } from "../types/currency.js";
import {
  InvalidMoneyAmount,
  MoneyPrecisionExceeded,
  IncompatibleCurrencyOperation,
} from "../errors/money-errors.js";

const MONEY_REGEX = /^-?\d+(\.\d{1,2})?$/;

export interface Money {
  readonly amount: string;
  readonly currency: CurrencyCode;
}

function normalizeDecimalString(value: string): string {
  const trimmed = value.trim();

  if (trimmed.includes(".")) {
    const [integer, decimal] = trimmed.split(".");
    const normalizedDecimal = decimal.padEnd(2, "0").slice(0, 2);
    return `${integer}.${normalizedDecimal}`;
  }

  return `${trimmed}.00`;
}

function validateAmount(amount: string): void {
  if (!MONEY_REGEX.test(amount)) {
    throw new InvalidMoneyAmount(amount);
  }

  const parts = amount.split(".");
  if (parts.length === 2 && parts[1].length > 2) {
    throw new MoneyPrecisionExceeded(amount);
  }
}

function ensureSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new IncompatibleCurrencyOperation(a.currency, b.currency);
  }
}

function parseToCents(value: string): bigint {
  const normalized = normalizeDecimalString(value);
  const [integer, decimal] = normalized.split(".");
  const centsStr = `${integer}${decimal}`;
  return BigInt(centsStr);
}

function fromCents(cents: bigint, currency: CurrencyCode): Money {
  const sign = cents < 0n ? "-" : "";
  const absolute = cents < 0n ? -cents : cents;
  const integerPart = absolute / 100n;
  const decimalPart = absolute % 100n;
  const decimalStr = decimalPart.toString().padStart(2, "0");
  return { amount: `${sign}${integerPart}.${decimalStr}`, currency };
}

export function createMoney(raw: string, currency: CurrencyCode): Money {
  const trimmed = raw.trim();
  validateAmount(trimmed);
  const amount = normalizeDecimalString(trimmed);
  return { amount, currency };
}

export function add(a: Money, b: Money): Money {
  ensureSameCurrency(a, b);
  const centsA = parseToCents(a.amount);
  const centsB = parseToCents(b.amount);
  return fromCents(centsA + centsB, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  ensureSameCurrency(a, b);
  const centsA = parseToCents(a.amount);
  const centsB = parseToCents(b.amount);
  return fromCents(centsA - centsB, a.currency);
}

export function compare(a: Money, b: Money): number {
  ensureSameCurrency(a, b);
  const centsA = parseToCents(a.amount);
  const centsB = parseToCents(b.amount);
  if (centsA < centsB) return -1;
  if (centsA > centsB) return 1;
  return 0;
}

export function isPositive(money: Money): boolean {
  return parseToCents(money.amount) > 0n;
}

export function isZero(money: Money): boolean {
  return parseToCents(money.amount) === 0n;
}

export function isNegative(money: Money): boolean {
  return parseToCents(money.amount) < 0n;
}

export function isGreaterOrEqual(a: Money, b: Money): boolean {
  return compare(a, b) >= 0;
}
