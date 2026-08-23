export { DomainError } from "./domain-error.js";

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
} from "./account-errors.js";

export {
  CategoryNameRequired,
  CategoryInvalidName,
  CategorySelfParent,
  CategoryCannotDeleteSelfParent,
  CategoryCannotDeleteArchived,
  CategoryCannotReactivateWithArchivedParent,
  CategoryCannotReactivateWithDeletedParent,
  CategoryCannotDeleteSoftDeleted,
} from "./category-errors.js";

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
} from "./transaction-errors.js";

export {
  InvalidMoneyAmount,
  MoneyPrecisionExceeded,
  IncompatibleCurrencyOperation,
} from "./money-errors.js";
