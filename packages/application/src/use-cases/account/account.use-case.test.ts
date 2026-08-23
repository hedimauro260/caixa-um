import { describe, it, expect, beforeEach } from "vitest";
import { CreateAccount } from "./create-account.js";
import { GetAccount } from "./get-account.js";
import { ArchiveAccount } from "./archive-account.js";
import { DeleteAccount } from "./delete-account.js";
import { RenameAccount } from "./rename-account.js";
import { ReactivateAccount } from "./reactivate-account.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { ApplicationContext } from "../../context.js";
import type { Account } from "@caixa-1/domain";
import { createAccountId } from "@caixa-1/domain";
import { AccountNotFound } from "@caixa-1/domain";
import { AccountNameAlreadyExists } from "../../errors/application-errors.js";

const ctx: ApplicationContext = {
  userId: "user-1",
  today: "2025-06-15",
};

function makeAccount(overrides?: Partial<Account>): Account {
  const id = createAccountId("00000000-0000-0000-0000-000000000001");
  return {
    id,
    userId: "user-1",
    name: "Nubank",
    type: "DIGITAL_WALLET",
    initialBalance: { amount: "1000.00", currency: "AOA" },
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

function createMockUnitOfWork(repo: AccountRepository): UnitOfWork {
  return {
    execute: async (fn) => {
      return fn({
        accountRepository: repo,
        categoryRepository: {} as any,
        transactionRepository: {} as any,
      });
    },
  };
}

describe("Account Use Cases", () => {
  describe("CreateAccount", () => {
    it("should create account successfully", async () => {
      const repo = createMockAccountRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new CreateAccount(uow);

      const result = await useCase.execute(ctx, {
        name: "Nubank",
        type: "DIGITAL_WALLET",
        initialBalance: "1000",
        currency: "AOA",
      });

      expect(result.name).toBe("Nubank");
      expect(result.type).toBe("DIGITAL_WALLET");
    });

    it("should throw AccountNameAlreadyExists when name exists", async () => {
      const repo = createMockAccountRepo({ existsByName: async () => true });
      const uow = createMockUnitOfWork(repo);
      const useCase = new CreateAccount(uow);

      await expect(
        useCase.execute(ctx, {
          name: "Nubank",
          type: "DIGITAL_WALLET",
          initialBalance: "1000",
          currency: "AOA",
        }),
      ).rejects.toThrow(AccountNameAlreadyExists);
    });
  });

  describe("GetAccount", () => {
    it("should return account when found", async () => {
      const repo = createMockAccountRepo();
      const useCase = new GetAccount(repo);

      const result = await useCase.execute(ctx, "00000000-0000-0000-0000-000000000001");
      expect(result.name).toBe("Nubank");
    });

    it("should throw AccountNotFound when not found", async () => {
      const repo = createMockAccountRepo({ findById: async () => null });
      const useCase = new GetAccount(repo);

      await expect(
        useCase.execute(ctx, "nonexistent-id"),
      ).rejects.toThrow(AccountNotFound);
    });
  });

  describe("RenameAccount", () => {
    it("should rename account", async () => {
      const repo = createMockAccountRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new RenameAccount(uow);

      const result = await useCase.execute(ctx, "00000000-0000-0000-0000-000000000001", {
        name: "Nubank V2",
      });
      expect(result.name).toBe("Nubank V2");
    });

    it("should throw AccountNotFound when not found", async () => {
      const repo = createMockAccountRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(repo);
      const useCase = new RenameAccount(uow);

      await expect(
        useCase.execute(ctx, "nonexistent", { name: "Test" }),
      ).rejects.toThrow(AccountNotFound);
    });
  });

  describe("ArchiveAccount", () => {
    it("should archive account", async () => {
      const repo = createMockAccountRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new ArchiveAccount(uow);

      const result = await useCase.execute(ctx, "00000000-0000-0000-0000-000000000001");
      expect(result.success).toBe(true);
    });

    it("should throw AccountNotFound when not found", async () => {
      const repo = createMockAccountRepo({ findById: async () => null });
      const uow = createMockUnitOfWork(repo);
      const useCase = new ArchiveAccount(uow);

      await expect(useCase.execute(ctx, "nonexistent")).rejects.toThrow(AccountNotFound);
    });
  });

  describe("ReactivateAccount", () => {
    it("should reactivate account", async () => {
      const repo = createMockAccountRepo({
        findByIdIncludingDeleted: async () => makeAccount({ isActive: false }),
      });
      const uow = createMockUnitOfWork(repo);
      const useCase = new ReactivateAccount(uow);

      const result = await useCase.execute(ctx, "00000000-0000-0000-0000-000000000001");
      expect(result.success).toBe(true);
    });
  });

  describe("DeleteAccount", () => {
    it("should soft delete account", async () => {
      const repo = createMockAccountRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new DeleteAccount(uow);

      const result = await useCase.execute(ctx, "00000000-0000-0000-0000-000000000001");
      expect(result.success).toBe(true);
    });
  });
});
