import { describe, it, expect } from "vitest";
import {
  createIncome,
  createExpense,
  createTransfer,
  updateTransactionDescription,
  updateTransactionDate,
  softDeleteTransaction,
} from "../transaction/transaction.js";
import {
  createTransactionId,
  createAccountId,
} from "../types/ids.js";
import {
  TransactionDescriptionRequired,
  TransactionInvalidDescription,
  TransactionAlreadyDeleted,
  SameAccountTransferError,
} from "../errors/transaction-errors.js";
import type { Transaction } from "../transaction/transaction.js";

const TX_ID = createTransactionId("00000000-0000-0000-0000-000000000001");
const ACCOUNT_ID_1 = createAccountId("00000000-0000-0000-0000-000000000010");
const ACCOUNT_ID_2 = createAccountId("00000000-0000-0000-0000-000000000020");

function makeIncome(): Transaction {
  return createIncome({
    id: TX_ID,
    userId: "user-1",
    accountId: ACCOUNT_ID_1,
    amount: "500",
    currency: "AOA",
    description: "Salario mensal",
    date: "2025-06-15",
  });
}

function makeExpense(): Transaction {
  return createExpense({
    id: TX_ID,
    userId: "user-1",
    accountId: ACCOUNT_ID_1,
    amount: "100",
    currency: "AOA",
    description: "Almoco no restaurante",
    date: "2025-06-15",
  });
}

function makeTransfer(): Transaction {
  return createTransfer({
    id: TX_ID,
    userId: "user-1",
    originAccountId: ACCOUNT_ID_1,
    destinationAccountId: ACCOUNT_ID_2,
    amount: "200",
    currency: "AOA",
    description: "Transferencia entre contas",
    date: "2025-06-15",
  });
}

describe("Transaction", () => {
  describe("createIncome", () => {
    it("should create income with CREDIT line", () => {
      const tx = makeIncome();
      expect(tx.type).toBe("INCOME");
      expect(tx.lines).toHaveLength(1);
      expect(tx.lines[0].direction).toBe("CREDIT");
      expect(tx.lines[0].accountId).toBe(ACCOUNT_ID_1);
      expect(tx.lines[0].amount.amount).toBe("500.00");
      expect(tx.categoryId).toBeNull();
    });

    it("should trim description", () => {
      const tx = createIncome({
        id: TX_ID,
        userId: "user-1",
        accountId: ACCOUNT_ID_1,
        amount: "100",
        currency: "AOA",
        description: "  Salario  ",
        date: "2025-06-15",
      });
      expect(tx.description).toBe("Salario");
    });

    it("should throw TransactionDescriptionRequired for empty", () => {
      expect(() =>
        createIncome({
          id: TX_ID,
          userId: "user-1",
          accountId: ACCOUNT_ID_1,
          amount: "100",
          currency: "AOA",
          description: "",
          date: "2025-06-15",
        }),
      ).toThrow(TransactionDescriptionRequired);
    });

    it("should throw TransactionInvalidDescription for < 3 chars", () => {
      expect(() =>
        createIncome({
          id: TX_ID,
          userId: "user-1",
          accountId: ACCOUNT_ID_1,
          amount: "100",
          currency: "AOA",
          description: "ab",
          date: "2025-06-15",
        }),
      ).toThrow(TransactionInvalidDescription);
    });

    it("should throw TransactionInvalidDescription for > 200 chars", () => {
      expect(() =>
        createIncome({
          id: TX_ID,
          userId: "user-1",
          accountId: ACCOUNT_ID_1,
          amount: "100",
          currency: "AOA",
          description: "A".repeat(201),
          date: "2025-06-15",
        }),
      ).toThrow(TransactionInvalidDescription);
    });
  });

  describe("createExpense", () => {
    it("should create expense with DEBIT line", () => {
      const tx = makeExpense();
      expect(tx.type).toBe("EXPENSE");
      expect(tx.lines).toHaveLength(1);
      expect(tx.lines[0].direction).toBe("DEBIT");
      expect(tx.lines[0].accountId).toBe(ACCOUNT_ID_1);
      expect(tx.lines[0].amount.amount).toBe("100.00");
    });

    it("should allow categoryId", () => {
      const catId = createAccountId("00000000-0000-0000-0000-000000000099");
      const tx = createExpense({
        id: TX_ID,
        userId: "user-1",
        accountId: ACCOUNT_ID_1,
        amount: "50",
        currency: "AOA",
        categoryId: catId,
        description: "Compra no supermercado",
        date: "2025-06-15",
      });
      expect(tx.categoryId).toBe(catId);
    });
  });

  describe("createTransfer", () => {
    it("should create transfer with DEBIT + CREDIT lines", () => {
      const tx = makeTransfer();
      expect(tx.type).toBe("TRANSFER");
      expect(tx.lines).toHaveLength(2);
      expect(tx.lines[0].direction).toBe("DEBIT");
      expect(tx.lines[0].accountId).toBe(ACCOUNT_ID_1);
      expect(tx.lines[1].direction).toBe("CREDIT");
      expect(tx.lines[1].accountId).toBe(ACCOUNT_ID_2);
      expect(tx.categoryId).toBeNull();
    });

    it("should have equal amounts for both lines", () => {
      const tx = makeTransfer();
      expect(tx.lines[0].amount.amount).toBe("200.00");
      expect(tx.lines[1].amount.amount).toBe("200.00");
    });

    it("should throw SameAccountTransferError for same account", () => {
      expect(() =>
        createTransfer({
          id: TX_ID,
          userId: "user-1",
          originAccountId: ACCOUNT_ID_1,
          destinationAccountId: ACCOUNT_ID_1,
          amount: "100",
          currency: "AOA",
          description: "Transferencia invalida",
          date: "2025-06-15",
        }),
      ).toThrow(SameAccountTransferError);
    });
  });

  describe("updateTransactionDescription", () => {
    it("should update description", () => {
      const tx = makeIncome();
      const updated = updateTransactionDescription(tx, "Novo salario");
      expect(updated.description).toBe("Novo salario");
    });

    it("should trim new description", () => {
      const tx = makeIncome();
      const updated = updateTransactionDescription(tx, "  Novo salario  ");
      expect(updated.description).toBe("Novo salario");
    });

    it("should throw TransactionAlreadyDeleted for deleted tx", () => {
      const tx = makeIncome();
      const deleted = softDeleteTransaction(tx);
      expect(() =>
        updateTransactionDescription(deleted, "Teste"),
      ).toThrow(TransactionAlreadyDeleted);
    });
  });

  describe("updateTransactionDate", () => {
    it("should update date", () => {
      const tx = makeIncome();
      const updated = updateTransactionDate(tx, "2025-07-01");
      expect(updated.date).toBe("2025-07-01");
    });

    it("should throw TransactionAlreadyDeleted for deleted tx", () => {
      const tx = makeIncome();
      const deleted = softDeleteTransaction(tx);
      expect(() => updateTransactionDate(deleted, "2025-07-01")).toThrow(
        TransactionAlreadyDeleted,
      );
    });
  });

  describe("softDeleteTransaction", () => {
    it("should soft delete transaction", () => {
      const tx = makeIncome();
      const deleted = softDeleteTransaction(tx);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw TransactionAlreadyDeleted for already deleted", () => {
      const tx = makeIncome();
      const deleted = softDeleteTransaction(tx);
      expect(() => softDeleteTransaction(deleted)).toThrow(
        TransactionAlreadyDeleted,
      );
    });
  });
});
