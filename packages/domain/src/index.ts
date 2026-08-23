export { AccountType } from "./types/account-type.js";
export type { AccountType as AccountTypeValue } from "./types/account-type.js";

export { TransactionType } from "./types/transaction-type.js";
export type { TransactionType as TransactionTypeValue } from "./types/transaction-type.js";

export { TransactionDirection } from "./types/transaction-direction.js";
export type { TransactionDirection as TransactionDirectionValue } from "./types/transaction-direction.js";

export type { CurrencyCode } from "./types/currency.js";
export { isValidCurrency } from "./types/currency.js";

export type {
  AccountId,
  UserId,
  CategoryId,
  TransactionId,
  TransactionLineId,
} from "./types/ids.js";
export {
  createUserId,
  createAccountId,
  createCategoryId,
  createTransactionId,
  createTransactionLineId,
} from "./types/ids.js";

export type { EconomicDate } from "./types/economic-date.js";
export {
  isValidEconomicDate,
  createEconomicDate,
  compareEconomicDate,
} from "./types/economic-date.js";

export type { FinancialEntry } from "./types/financial-entry.js";

export { DomainError } from "./errors/domain-error.js";

export {
  AccountNameRequired,
  AccountInvalidName,
  InvalidAccountType,
  AccountInvalidInitialBalance,
  AccountAlreadyArchived,
  AccountAlreadyActive,
  AccountCannotBeDeletedWithNonZeroBalance,
  AccountCannotBeDeletedWithFutureTransactions,
  AccountCannotBeReactivated,
  AccountCannotBeDeletedSoftDeleted,
  AccountNotFound,
} from "./errors/account-errors.js";

export {
  CategoryNameRequired,
  CategoryInvalidName,
  CategorySelfParent,
  CategoryCannotDeleteSelfParent,
  CategoryCannotDeleteArchived,
  CategoryCannotReactivateWithArchivedParent,
  CategoryCannotReactivateWithDeletedParent,
  CategoryCannotDeleteSoftDeleted,
  CategoryNotFound,
} from "./errors/category-errors.js";

export {
  TransactionDescriptionRequired,
  TransactionInvalidDescription,
  TransactionDateRequired,
  InvalidTransactionType,
  TransactionLinesCannotBeEmpty,
  TransactionInvalidLineCount,
  TransactionLineMustBeCredit,
  TransactionLineMustBeDebit,
  SameAccountTransferError,
  TransferAmountsMustBeEqual,
  TransactionCategoryCannotBeUsedWithTransfer,
  TransactionCannotBeDeleted,
  TransactionAlreadyDeleted,
  TransactionCannotDeleteFutureOnCASH,
  TransactionCannotChangeType,
  TransactionNotFound,
} from "./errors/transaction-errors.js";

export {
  InvalidMoneyAmount,
  MoneyPrecisionExceeded,
  IncompatibleCurrencyOperation,
} from "./errors/money-errors.js";

export {
  UserNotFound,
  UserNameRequired,
  UserInvalidName,
  UserAlreadyExists,
} from "./errors/user-errors.js";

export type { Money } from "./money/money.js";
export {
  createMoney,
  add,
  subtract,
  compare,
  isPositive,
  isZero,
  isNegative,
  isGreaterOrEqual,
} from "./money/money.js";

export type { Account } from "./account/account.js";
export {
  createAccount,
  renameAccount,
  archiveAccount,
  reactivateAccount,
  deleteAccount,
  updateAccountIncludeInTotal,
} from "./account/account.js";

export type { Category } from "./category/category.js";
export {
  createCategory,
  renameCategory,
  archiveCategory,
  reactivateCategory,
  deleteCategory,
} from "./category/category.js";

export type { TransactionLine } from "./transaction/transaction-line.js";
export { createTransactionLine } from "./transaction/transaction-line.js";

export type { Transaction } from "./transaction/transaction.js";
export {
  createIncome,
  createExpense,
  createTransfer,
  updateTransactionDescription,
  updateTransactionDate,
  softDeleteTransaction,
} from "./transaction/transaction.js";

export type {
  BalanceCalculationInput,
  FinancialViolation,
  BalanceResult,
} from "./balance/balance-service.js";
export {
  calculateBalance,
  filterEntriesBeforeDate,
  filterActiveEntries,
} from "./balance/balance-service.js";

export type { User, CreateUserInput } from "./user/user.js";
export { createUser, updateUserProfile } from "./user/user.js";
