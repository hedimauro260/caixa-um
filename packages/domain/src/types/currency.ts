const CURRENCIES = ["AOA", "USD", "EUR", "GBP"] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export function isValidCurrency(value: string): value is CurrencyCode {
  return (CURRENCIES as readonly string[]).includes(value);
}
