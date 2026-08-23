declare const __brand: unique symbol;

type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId = Brand<string, "UserId">;
export type AccountId = Brand<string, "AccountId">;
export type CategoryId = Brand<string, "CategoryId">;
export type TransactionId = Brand<string, "TransactionId">;
export type TransactionLineId = Brand<string, "TransactionLineId">;

export function createUserId(value: string): UserId {
  return value as UserId;
}

export function createAccountId(value: string): AccountId {
  return value as AccountId;
}

export function createCategoryId(value: string): CategoryId {
  return value as CategoryId;
}

export function createTransactionId(value: string): TransactionId {
  return value as TransactionId;
}

export function createTransactionLineId(value: string): TransactionLineId {
  return value as TransactionLineId;
}
