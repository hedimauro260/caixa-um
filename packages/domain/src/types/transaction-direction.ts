export const TransactionDirection = {
  DEBIT: "DEBIT",
  CREDIT: "CREDIT",
} as const;

export type TransactionDirection =
  (typeof TransactionDirection)[keyof typeof TransactionDirection];
