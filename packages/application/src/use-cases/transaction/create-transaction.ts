import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type {
  CreateIncomeInput,
  CreateExpenseInput,
  CreateTransferInput,
  TransactionOutput,
} from "../../dto/transaction-dto.js";
import { createIncome, createExpense, createTransfer } from "@caixa-1/domain";
import { AccountNotFound, CategoryNotFound } from "@caixa-1/domain";
import { createTransactionId } from "@caixa-1/domain";
import type { AccountId, CategoryId, EconomicDate } from "@caixa-1/domain";

export class CreateTransaction {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async executeIncome(
    context: ApplicationContext,
    input: CreateIncomeInput,
  ): Promise<TransactionOutput> {
    const created = await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const account = await accountRepo.findById(input.accountId, context.userId);
      if (!account) {
        throw new AccountNotFound(input.accountId);
      }

      if (input.categoryId !== null && input.categoryId !== undefined) {
        const category = await categoryRepo.findById(
          input.categoryId,
          context.userId,
        );
        if (!category) {
          throw new CategoryNotFound(input.categoryId);
        }
      }

      const transaction = createIncome({
        id: createTransactionId(crypto.randomUUID()),
        userId: context.userId,
        accountId: input.accountId as AccountId,
        amount: input.amount,
        currency: input.currency,
        categoryId: input.categoryId as CategoryId | null | undefined,
        description: input.description,
        date: input.date as EconomicDate,
      });

      await repos.transactionRepository.save(transaction);
      return transaction;
    });

    return {
      id: created.id,
      type: created.type,
      categoryId: created.categoryId,
      description: created.description,
      date: created.date,
      lines: created.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async executeExpense(
    context: ApplicationContext,
    input: CreateExpenseInput,
  ): Promise<TransactionOutput> {
    const created = await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const account = await accountRepo.findById(input.accountId, context.userId);
      if (!account) {
        throw new AccountNotFound(input.accountId);
      }

      if (input.categoryId !== null && input.categoryId !== undefined) {
        const category = await categoryRepo.findById(
          input.categoryId,
          context.userId,
        );
        if (!category) {
          throw new CategoryNotFound(input.categoryId);
        }
      }

      const transaction = createExpense({
        id: createTransactionId(crypto.randomUUID()),
        userId: context.userId,
        accountId: input.accountId as AccountId,
        amount: input.amount,
        currency: input.currency,
        categoryId: input.categoryId as CategoryId | null | undefined,
        description: input.description,
        date: input.date as EconomicDate,
      });

      await repos.transactionRepository.save(transaction);
      return transaction;
    });

    return {
      id: created.id,
      type: created.type,
      categoryId: created.categoryId,
      description: created.description,
      date: created.date,
      lines: created.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async executeTransfer(
    context: ApplicationContext,
    input: CreateTransferInput,
  ): Promise<TransactionOutput> {
    const created = await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;

      const origin = await accountRepo.findById(input.originAccountId, context.userId);
      if (!origin) {
        throw new AccountNotFound(input.originAccountId);
      }

      const destination = await accountRepo.findById(input.destinationAccountId, context.userId);
      if (!destination) {
        throw new AccountNotFound(input.destinationAccountId);
      }

      const transaction = createTransfer({
        id: createTransactionId(crypto.randomUUID()),
        userId: context.userId,
        originAccountId: input.originAccountId as AccountId,
        destinationAccountId: input.destinationAccountId as AccountId,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        date: input.date as EconomicDate,
      });

      await repos.transactionRepository.save(transaction);
      return transaction;
    });

    return {
      id: created.id,
      type: created.type,
      categoryId: created.categoryId,
      description: created.description,
      date: created.date,
      lines: created.lines.map((line) => ({
        id: line.id,
        accountId: line.accountId,
        direction: line.direction,
        amount: {
          amount: line.amount.amount,
          currency: line.amount.currency,
        },
      })),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
