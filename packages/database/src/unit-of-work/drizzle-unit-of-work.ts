import { db } from "../client";
import { DrizzleAccountRepository } from "../repositories/drizzle-account-repository";
import { DrizzleCategoryRepository } from "../repositories/drizzle-category-repository";
import { DrizzleTransactionRepository } from "../repositories/drizzle-transaction-repository";
import type { UnitOfWork, RepositorySet } from "@caixa-1/application";

export class DrizzleUnitOfWork implements UnitOfWork {
  async execute<T>(fn: (repos: RepositorySet) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => {
      const repos: RepositorySet = {
        accountRepository: new DrizzleAccountRepository(tx as any),
        categoryRepository: new DrizzleCategoryRepository(tx as any),
        transactionRepository: new DrizzleTransactionRepository(tx as any),
      };
      return fn(repos);
    });
  }
}
