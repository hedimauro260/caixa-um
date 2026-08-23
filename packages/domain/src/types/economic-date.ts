import { DomainError } from "../errors/domain-error.js";

declare const __brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type EconomicDate = Brand<string, "EconomicDate">;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isValidEconomicDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12) {
    return false;
  }

  if (day < 1 || day > daysInMonth(year, month)) {
    return false;
  }

  return true;
}

export function createEconomicDate(value: string): EconomicDate {
  if (!isValidEconomicDate(value)) {
    throw new DomainError(
      "INVALID_ECONOMIC_DATE",
      `Data econômica inválida: ${value}`,
    );
  }
  return value as EconomicDate;
}

export function compareEconomicDate(a: EconomicDate, b: EconomicDate): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
