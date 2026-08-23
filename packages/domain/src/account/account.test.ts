import { describe, it, expect } from "vitest";
import {
  createAccount,
  renameAccount,
  archiveAccount,
  reactivateAccount,
  deleteAccount,
  updateAccountIncludeInTotal,
} from "../account/account.js";
import { createAccountId } from "../types/ids.js";
import {
  AccountNameRequired,
  AccountInvalidName,
  AccountInvalidInitialBalance,
  AccountAlreadyArchived,
  AccountAlreadyActive,
} from "../errors/account-errors.js";
import type { Account } from "../account/account.js";

function makeAccount(overrides?: Partial<Account>): Account {
  const base: Account = {
    id: createAccountId("00000000-0000-0000-0000-000000000001"),
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
  };
  return { ...base, ...overrides };
}

function createValidAccount(overrides?: Parameters<typeof createAccount>[0]) {
  return createAccount({
    id: createAccountId("00000000-0000-0000-0000-000000000001"),
    userId: "user-1",
    name: "Nubank",
    type: "DIGITAL_WALLET",
    initialBalance: "1000",
    currency: "AOA",
    ...overrides,
  });
}

describe("Account", () => {
  describe("createAccount", () => {
    it("should create account with valid data", () => {
      const account = createValidAccount();
      expect(account.name).toBe("Nubank");
      expect(account.type).toBe("DIGITAL_WALLET");
      expect(account.initialBalance.amount).toBe("1000.00");
      expect(account.initialBalance.currency).toBe("AOA");
      expect(account.isActive).toBe(true);
      expect(account.includeInTotal).toBe(true);
      expect(account.deletedAt).toBeNull();
    });

    it("should trim name", () => {
      const account = createValidAccount({ name: "  Nubank  " });
      expect(account.name).toBe("Nubank");
    });

    it("should throw AccountNameRequired for empty name", () => {
      expect(() => createValidAccount({ name: "" })).toThrow(AccountNameRequired);
    });

    it("should throw AccountNameRequired for whitespace name", () => {
      expect(() => createValidAccount({ name: "   " })).toThrow(AccountNameRequired);
    });

    it("should throw AccountInvalidName for name > 50 chars", () => {
      expect(() => createValidAccount({ name: "A".repeat(51) })).toThrow(AccountInvalidName);
    });

    it("should allow name with exactly 50 chars", () => {
      const account = makeAccount({ name: "A".repeat(50) });
      expect(account.name).toHaveLength(50);
    });

    it("should set includeInTotal default to true", () => {
      const account = makeAccount();
      expect(account.includeInTotal).toBe(true);
    });

    it("should set description/color/icon defaults to null", () => {
      const account = makeAccount();
      expect(account.description).toBeNull();
      expect(account.color).toBeNull();
      expect(account.icon).toBeNull();
    });
  });

  describe("CASH account validation", () => {
    it("should create CASH account with zero balance", () => {
      const account = createValidAccount({
        type: "CASH",
        initialBalance: "0",
      });
      expect(account.initialBalance.amount).toBe("0.00");
    });

    it("should create CASH account with positive balance", () => {
      const account = createValidAccount({
        type: "CASH",
        initialBalance: "500",
      });
      expect(account.initialBalance.amount).toBe("500.00");
    });

    it("should throw AccountInvalidInitialBalance for CASH with negative balance", () => {
      expect(() =>
        createValidAccount({
          type: "CASH",
          initialBalance: "-100",
        }),
      ).toThrow(AccountInvalidInitialBalance);
    });

    it("should allow BANK with negative balance", () => {
      const account = createValidAccount({
        type: "BANK",
        initialBalance: "-500",
      });
      expect(account.initialBalance.amount).toBe("-500.00");
    });

    it("should allow CREDIT_CARD with negative balance", () => {
      const account = createValidAccount({
        type: "CREDIT_CARD",
        initialBalance: "-1000",
      });
      expect(account.initialBalance.amount).toBe("-1000.00");
    });
  });

  describe("renameAccount", () => {
    it("should rename account", () => {
      const account = makeAccount();
      const renamed = renameAccount(account, "Nubank V2");
      expect(renamed.name).toBe("Nubank V2");
      expect(renamed.updatedAt.getTime()).toBeGreaterThanOrEqual(account.updatedAt.getTime());
    });

    it("should trim new name", () => {
      const account = makeAccount();
      const renamed = renameAccount(account, "  New Name  ");
      expect(renamed.name).toBe("New Name");
    });

    it("should throw AccountNameRequired for empty name", () => {
      const account = makeAccount();
      expect(() => renameAccount(account, "")).toThrow(AccountNameRequired);
    });
  });

  describe("archiveAccount", () => {
    it("should archive active account", () => {
      const account = makeAccount();
      const archived = archiveAccount(account);
      expect(archived.isActive).toBe(false);
    });

    it("should throw AccountAlreadyArchived for already archived", () => {
      const account = makeAccount({ isActive: false });
      expect(() => archiveAccount(account)).toThrow(AccountAlreadyArchived);
    });
  });

  describe("reactivateAccount", () => {
    it("should reactivate archived account", () => {
      const account = makeAccount({ isActive: false });
      const reactivated = reactivateAccount(account);
      expect(reactivated.isActive).toBe(true);
    });

    it("should throw AccountAlreadyActive for active account", () => {
      const account = makeAccount({ isActive: true });
      expect(() => reactivateAccount(account)).toThrow(AccountAlreadyActive);
    });

    it("should throw AccountAlreadyActive for soft-deleted account", () => {
      const account = makeAccount({
        isActive: false,
        deletedAt: new Date(),
      });
      expect(() => reactivateAccount(account)).toThrow(AccountAlreadyActive);
    });
  });

  describe("deleteAccount", () => {
    it("should soft delete account", () => {
      const account = makeAccount();
      const deleted = deleteAccount(account);
      expect(deleted.isActive).toBe(false);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe("updateAccountIncludeInTotal", () => {
    it("should set includeInTotal to true", () => {
      const account = makeAccount({ includeInTotal: false });
      const updated = updateAccountIncludeInTotal(account, true);
      expect(updated.includeInTotal).toBe(true);
    });

    it("should set includeInTotal to false", () => {
      const account = makeAccount({ includeInTotal: true });
      const updated = updateAccountIncludeInTotal(account, false);
      expect(updated.includeInTotal).toBe(false);
    });
  });
});
