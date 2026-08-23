import { pgEnum } from "drizzle-orm/pg-core";

export const accountType = pgEnum("account_type", [
  "BANK",
  "CASH",
  "DIGITAL_WALLET",
  "CREDIT_CARD",
]);

export const directionType = pgEnum("direction_type", ["DEBIT", "CREDIT"]);
