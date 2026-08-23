export const AccountType = {
  BANK: "BANK",
  CASH: "CASH",
  DIGITAL_WALLET: "DIGITAL_WALLET",
  CREDIT_CARD: "CREDIT_CARD",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];
