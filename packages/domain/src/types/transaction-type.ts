export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
