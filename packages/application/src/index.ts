export type { ApplicationContext } from "./context.js";
export type { UnitOfWork, RepositorySet } from "./unit-of-work.js";

export type { AccountRepository } from "./repositories/account-repository.js";
export type { CategoryRepository } from "./repositories/category-repository.js";
export type { TransactionRepository, TransactionFilters } from "./repositories/transaction-repository.js";
export type { UserRepository } from "./repositories/user-repository.js";

export type { MoneyOutput, PaginationInput } from "./dto/common-dto.js";
export type {
  CreateAccountInput,
  UpdateAccountInput,
  AccountOutput,
} from "./dto/account-dto.js";
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryOutput,
  CategoryTreeOutput,
} from "./dto/category-dto.js";
export type {
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
  UpdateTransactionInput,
  TransactionLineOutput,
  TransactionOutput,
} from "./dto/transaction-dto.js";
export type { BalanceOutput, BalanceViolationOutput } from "./dto/balance-dto.js";
export type { JournalInput, JournalOutput } from "./dto/journal-dto.js";

export {
  ApplicationError,
  OperationNotAllowed,
  AccountNameAlreadyExists,
  CategoryNameAlreadyExists,
} from "./errors/application-errors.js";

export {
  CreateAccount,
  RenameAccount,
  ArchiveAccount,
  ReactivateAccount,
  DeleteAccount,
  GetAccount,
  CreateCategory,
  UpdateCategory,
  ArchiveCategory,
  ReactivateCategory,
  DeleteCategory,
  GetCategory,
  ListCategories,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
  GetTransaction,
  GetAccountBalance,
  GetHistoricalBalance,
  GetTotalBalance,
  GetJournal,
} from "./use-cases/index.js";
