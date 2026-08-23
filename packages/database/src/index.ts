export { db, checkDatabaseConnection } from "./client";

export * from "./schema/users";
export * from "./schema/accounts";
export * from "./schema/categories";
export * from "./schema/transactions";
export * from "./schema/transaction-lines";
export * from "./schema/enums";

export * from "./relations";

export { DrizzleAccountRepository } from "./repositories/drizzle-account-repository.js";
export { DrizzleCategoryRepository } from "./repositories/drizzle-category-repository.js";
export { DrizzleTransactionRepository } from "./repositories/drizzle-transaction-repository.js";
export { DrizzleUserRepository } from "./repositories/drizzle-user-repository.js";

export { DrizzleUnitOfWork } from "./unit-of-work/drizzle-unit-of-work.js";

export {
  toAccountDomain,
  toAccountPersistence,
} from "./mappers/account-mapper.js";
export {
  toCategoryDomain,
  toCategoryPersistence,
} from "./mappers/category-mapper.js";
export {
  toTransactionLineDomain,
  toTransactionDomain,
  toTransactionPersistence,
  toFinancialEntry,
} from "./mappers/transaction-mapper.js";
export {
  toUserDomain,
  toUserPersistence,
} from "./mappers/user-mapper.js";
