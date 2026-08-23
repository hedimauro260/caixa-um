import type { AccountRepository } from "./repositories/account-repository.js";
import type { CategoryRepository } from "./repositories/category-repository.js";
import type { TransactionRepository } from "./repositories/transaction-repository.js";

export interface RepositorySet {
  accountRepository: AccountRepository;
  categoryRepository: CategoryRepository;
  transactionRepository: TransactionRepository;
}

export interface UnitOfWork {
  execute<T>(fn: (repos: RepositorySet) => Promise<T>): Promise<T>;
}
