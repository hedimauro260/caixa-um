import { describe, it, expect } from "vitest";
import { CreateTransaction } from "./create-transaction.js";
import { GetTransaction } from "./get-transaction.js";
import { UpdateTransaction } from "./update-transaction.js";
import { DeleteTransaction } from "./delete-transaction.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { ApplicationContext } from "../../context.js";
import type { Account, Category, Transaction } from "@caixa-1/domain";
import { createAccountId, createCategoryId, createTransactionId } from "@caixa-1/domain";
import { AccountNotFound, CategoryNotFound, TransactionNotFound } from "@caixa-1/domain";

const ctx: ApplicationContext = { userId: "user-1", today: "2025-06-15" };
const ACC_ID = createAccountId("00000000-0000-0000-0000-000000000010");
const CAT_ID = createCategoryId("00000000-0000-0000-0000-000000000030");
const TX_ID = createTransactionId("00000000-0000-0000-0000-000000000001");

function makeAccount(overrides?: Partial<Account>): Account {
  return {
    id: ACC_ID,
    userId: "user-1",
    name: "Nubank",
    type: "DIGITAL_WALLET",
    initialBalance: { amount: "5000.00", currency: "AOA" },
    description: null,
    color: null,
    icon: null,
    isActive: true,
    includeInTotal: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: CAT_ID,
    userId: "user-1",
    name: "Alimentacao",
    type: "EXPENSE",
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function makeTransaction(overrides?: Partial<Transaction>): Transaction {
  return {
    id: TX_ID,
    userId: "user-1",
    type: "INCOME",
    categoryId: null,
    description: "Salario mensal",
    date: "2025-06-15",
    lines: [
      {
        id: "line-1" as any,
        accountId: ACC_ID,
        direction: "CREDIT",
        amount: { amount: "500.00", currency: "AOA" },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function createMockAccountRepo(overrides?: Partial<AccountRepository>): AccountRepository {
  return {
    findById: async () => makeAccount(),
    findByIdIncludingDeleted: async () => makeAccount(),
    findAllByUserId: async () => [makeAccount()],
    existsByName: async () => false,
    save: async () => {},
    update: async () => {},
    ...overrides,
  };
}

function createMockCategoryRepo(overrides?: Partial<CategoryRepository>): CategoryRepository {
  return {
    findById: async () => makeCategory(),
    findByIdIncludingDeleted: async () => makeCategory(),
    existsByName: async () => false,
    findAncestors: async () => [],
    findAllByUserId: async () => [makeCategory()],
    save: async () => {},
    update: async () => {},
    ...overrides,
  };
}

function createMockTransactionRepo(overrides?: Partial<TransactionRepository>): TransactionRepository {
  return {
    findById: async () => makeTransaction(),
    findByAccountUntilDate: async () => [],
    findByAccountIds: async () => [],
    findMany: async () => [],
    countByFilters: async () => 0,
    save: async () => {},
    update: async () => {},
    ...overrides,
  };
}

function createMockUnitOfWork(
  accountRepo: AccountRepository,
  txRepo: TransactionRepository,
  categoryRepo?: CategoryRepository,
): UnitOfWork {
  return {
    execute: async (fn) => {
      return fn({
        accountRepository: accountRepo,
        categoryRepository: categoryRepo ?? createMockCategoryRepo(),
        transactionRepository: txRepo,
      });
    },
  };
}

describe("Transaction Use Cases", () => {
  describe("CreateTransaction", () => {
    it("should create income transaction", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(accRepo, txRepo);
      const useCase = new CreateTransaction(uow);

      const result = await useCase.executeIncome(ctx, {
        accountId: ACC_ID,
        amount: "500",
        currency: "AOA",
        description: "Salario mensal",
        date: "2025-06-15",
      });

      expect(result.type).toBe("INCOME");
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].direction).toBe("CREDIT");
    });

    it("should create income with valid categoryId", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const catRepo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(accRepo, txRepo, catRepo);
      const useCase = new CreateTransaction(uow);

      const result = await useCase.executeIncome(ctx, {
        accountId: ACC_ID,
        amount: "500",
        currency: "AOA",
        categoryId: CAT_ID,
        description: "Salario mensal",
        date: "2025-06-15",
      });

      expect(result.type).toBe("INCOME");
      expect(result.categoryId).toBe(CAT_ID);
    });

    it("should throw CategoryNotFound when categoryId belongs to another user (income)", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const catRepo = createMockCategoryRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(accRepo, txRepo, catRepo);
      const useCase = new CreateTransaction(uow);

      await expect(
        useCase.executeIncome(ctx, {
          accountId: ACC_ID,
          amount: "500",
          currency: "AOA",
          categoryId: CAT_ID,
          description: "Salario mensal",
          date: "2025-06-15",
        }),
      ).rejects.toThrow(CategoryNotFound);
    });

    it("should create expense transaction", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(accRepo, txRepo);
      const useCase = new CreateTransaction(uow);

      const result = await useCase.executeExpense(ctx, {
        accountId: ACC_ID,
        amount: "100",
        currency: "AOA",
        description: "Almoco no restaurante",
        date: "2025-06-15",
      });

      expect(result.type).toBe("EXPENSE");
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].direction).toBe("DEBIT");
    });

    it("should throw CategoryNotFound when categoryId belongs to another user (expense)", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const catRepo = createMockCategoryRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(accRepo, txRepo, catRepo);
      const useCase = new CreateTransaction(uow);

      await expect(
        useCase.executeExpense(ctx, {
          accountId: ACC_ID,
          amount: "100",
          currency: "AOA",
          categoryId: CAT_ID,
          description: "Almoco no restaurante",
          date: "2025-06-15",
        }),
      ).rejects.toThrow(CategoryNotFound);
    });

    it("should create transfer transaction", async () => {
      const accRepo = createMockAccountRepo();
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(accRepo, txRepo);
      const useCase = new CreateTransaction(uow);

      const result = await useCase.executeTransfer(ctx, {
        originAccountId: ACC_ID,
        destinationAccountId: createAccountId("00000000-0000-0000-0000-000000000020"),
        amount: "200",
        currency: "AOA",
        description: "Transferencia entre contas",
        date: "2025-06-15",
      });

      expect(result.type).toBe("TRANSFER");
      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].direction).toBe("DEBIT");
      expect(result.lines[1].direction).toBe("CREDIT");
    });

    it("should throw AccountNotFound when account does not exist", async () => {
      const accRepo = createMockAccountRepo({ findById: async () => null });
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(accRepo, txRepo);
      const useCase = new CreateTransaction(uow);

      await expect(
        useCase.executeIncome(ctx, {
          accountId: ACC_ID,
          amount: "100",
          currency: "AOA",
          description: "Teste",
          date: "2025-06-15",
        }),
      ).rejects.toThrow(AccountNotFound);
    });
  });

  describe("GetTransaction", () => {
    it("should return transaction", async () => {
      const txRepo = createMockTransactionRepo();
      const useCase = new GetTransaction(txRepo);
      const result = await useCase.execute(ctx, TX_ID);
      expect(result.id).toBeTruthy();
      expect(result.type).toBe("INCOME");
    });

    it("should throw TransactionNotFound", async () => {
      const txRepo = createMockTransactionRepo({ findById: async () => null });
      const useCase = new GetTransaction(txRepo);
      await expect(useCase.execute(ctx, TX_ID)).rejects.toThrow(TransactionNotFound);
    });
  });

  describe("UpdateTransaction", () => {
    it("should update description", async () => {
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new UpdateTransaction(uow);

      const result = await useCase.execute(ctx, TX_ID, {
        description: "Nova descricao",
      });
      expect(result.description).toBe("Nova descricao");
    });

    it("should update categoryId with valid ownership", async () => {
      const txRepo = createMockTransactionRepo();
      const catRepo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo, catRepo);
      const useCase = new UpdateTransaction(uow);

      const result = await useCase.execute(ctx, TX_ID, {
        categoryId: CAT_ID,
      });
      expect(result.categoryId).toBe(CAT_ID);
    });

    it("should set categoryId to null (remove category)", async () => {
      const txRepo = createMockTransactionRepo({
        findById: async () => makeTransaction({ categoryId: CAT_ID }),
      });
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new UpdateTransaction(uow);

      const result = await useCase.execute(ctx, TX_ID, {
        categoryId: null,
      });
      expect(result.categoryId).toBeNull();
    });

    it("should not change categoryId when undefined", async () => {
      const txRepo = createMockTransactionRepo({
        findById: async () => makeTransaction({ categoryId: CAT_ID }),
      });
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new UpdateTransaction(uow);

      const result = await useCase.execute(ctx, TX_ID, {
        description: "Updated",
      });
      expect(result.categoryId).toBe(CAT_ID);
    });

    it("should throw CategoryNotFound when categoryId belongs to another user", async () => {
      const txRepo = createMockTransactionRepo();
      const catRepo = createMockCategoryRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo, catRepo);
      const useCase = new UpdateTransaction(uow);

      await expect(
        useCase.execute(ctx, TX_ID, { categoryId: CAT_ID }),
      ).rejects.toThrow(CategoryNotFound);
    });

    it("should throw TransactionNotFound", async () => {
      const txRepo = createMockTransactionRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new UpdateTransaction(uow);

      await expect(
        useCase.execute(ctx, TX_ID, { description: "Teste" }),
      ).rejects.toThrow(TransactionNotFound);
    });
  });

  describe("DeleteTransaction", () => {
    it("should soft delete transaction", async () => {
      const txRepo = createMockTransactionRepo();
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new DeleteTransaction(uow);

      const result = await useCase.execute(ctx, TX_ID);
      expect(result.success).toBe(true);
    });

    it("should throw TransactionNotFound", async () => {
      const txRepo = createMockTransactionRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(createMockAccountRepo(), txRepo);
      const useCase = new DeleteTransaction(uow);

      await expect(useCase.execute(ctx, TX_ID)).rejects.toThrow(TransactionNotFound);
    });
  });
});
