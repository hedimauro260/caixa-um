import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";

vi.mock("@caixa-1/config", () => ({
  config: {
    database: {
      url: process.env.TEST_DATABASE_URL ?? "postgresql://caixa1:caixa1_dev@localhost:5432/caixa1",
    },
  },
}));

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DrizzleTransactionRepository } from "./drizzle-transaction-repository.js";
import { users } from "../schema/users.js";
import { accounts } from "../schema/accounts.js";
import { transactions } from "../schema/transactions.js";
import { transactionLines } from "../schema/transaction-lines.js";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://caixa1:caixa1_dev@localhost:5432/caixa1_test";

const client = postgres(TEST_DATABASE_URL);
const db = drizzle(client);

let repo: DrizzleTransactionRepository;
let testUserId: string;
let testAccountAId: string;
let testAccountBId: string;

let lineCounter = 0;
function nextLineId(): string {
  lineCounter++;
  const hex = lineCounter.toString(16).padStart(12, "0");
  return `00000000-0000-0000-0000-${hex}`;
}

let txCounter = 0;
function nextTxId(): string {
  txCounter++;
  const hex = txCounter.toString(16).padStart(12, "0");
  return `00000000-0000-0000-0000-${hex}`;
}

async function cleanup() {
  await db.delete(transactionLines);
  await db.delete(transactions);
  await db.delete(accounts);
  await db.delete(users);
}

async function insertUser(id: string): Promise<void> {
  await db.insert(users).values({
    id,
    clerkId: `clerk-${id}`,
    email: `test-${id}@example.com`,
    name: "Test User",
    baseCurrency: "AOA",
  });
}

async function insertAccount(id: string, userId: string, name: string): Promise<void> {
  await db.insert(accounts).values({
    id,
    userId,
    name,
    type: "BANK",
    initialBalance: "0",
    currency: "AOA",
  });
}

async function insertTransaction(
  id: string,
  userId: string,
  description: string,
  date: string,
): Promise<void> {
  await db.insert(transactions).values({
    id,
    userId,
    description,
    date,
  });
}

async function insertTransactionLine(
  id: string,
  transactionId: string,
  accountId: string,
  direction: "DEBIT" | "CREDIT",
  amount: string,
): Promise<void> {
  await db.insert(transactionLines).values({
    id,
    transactionId,
    accountId,
    direction,
    amount,
  });
}

describe("DrizzleTransactionRepository", () => {
  beforeAll(async () => {
    repo = new DrizzleTransactionRepository(db);
    await cleanup();

    testUserId = "00000000-0000-0000-0000-000000000001";
    testAccountAId = "00000000-0000-0000-0000-000000000010";
    testAccountBId = "00000000-0000-0000-0000-000000000020";

    await insertUser(testUserId);
    await insertAccount(testAccountAId, testUserId, "Account A");
    await insertAccount(testAccountBId, testUserId, "Account B");
  });

  afterAll(async () => {
    await cleanup();
    await client.end();
  });

  beforeEach(async () => {
    await db.delete(transactionLines);
    await db.delete(transactions);
    lineCounter = 0;
    txCounter = 0;
  });

  describe("findMany with accountId filter", () => {
    it("should return all transactions for a given account", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction ${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      const result = await repo.findMany(
        testUserId,
        { accountId: testAccountAId },
        { offset: 0, limit: 100 },
      );

      expect(result).toHaveLength(10);
    });

    it("should filter correctly between two accounts", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction A${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      for (let i = 1; i <= 5; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction B${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountBId, "DEBIT", "50.00");
      }

      const resultA = await repo.findMany(
        testUserId,
        { accountId: testAccountAId },
        { offset: 0, limit: 100 },
      );

      const resultB = await repo.findMany(
        testUserId,
        { accountId: testAccountBId },
        { offset: 0, limit: 100 },
      );

      expect(resultA).toHaveLength(10);
      expect(resultB).toHaveLength(5);
    });

    it("should return all transactions when no filter is applied", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction A${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      for (let i = 1; i <= 5; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction B${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountBId, "DEBIT", "50.00");
      }

      const result = await repo.findMany(
        testUserId,
        {},
        { offset: 0, limit: 100 },
      );

      expect(result).toHaveLength(15);
    });

    it("should handle transactions with multiple lines for the same account", async () => {
      const txId = nextTxId();
      await insertTransaction(txId, testUserId, "Transfer between accounts", "2025-06-15");
      await insertTransactionLine(nextLineId(), txId, testAccountAId, "DEBIT", "200.00");
      await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "200.00");

      const result = await repo.findMany(
        testUserId,
        { accountId: testAccountAId },
        { offset: 0, limit: 100 },
      );

      expect(result).toHaveLength(1);
      expect(result[0].lines).toHaveLength(2);
    });
  });

  describe("countByFilters with accountId filter", () => {
    it("should count all transactions for a given account", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction ${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      const count = await repo.countByFilters(testUserId, {
        accountId: testAccountAId,
      });

      expect(count).toBe(10);
    });

    it("should count correctly between two accounts", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction A${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      for (let i = 1; i <= 5; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction B${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountBId, "DEBIT", "50.00");
      }

      const countA = await repo.countByFilters(testUserId, {
        accountId: testAccountAId,
      });

      const countB = await repo.countByFilters(testUserId, {
        accountId: testAccountBId,
      });

      expect(countA).toBe(10);
      expect(countB).toBe(5);
    });

    it("should count all transactions when no filter is applied", async () => {
      for (let i = 1; i <= 10; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction A${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountAId, "CREDIT", "100.00");
      }

      for (let i = 1; i <= 5; i++) {
        const txId = nextTxId();
        await insertTransaction(txId, testUserId, `Transaction B${String(i).padStart(3, "0")}`, "2025-06-15");
        await insertTransactionLine(nextLineId(), txId, testAccountBId, "DEBIT", "50.00");
      }

      const count = await repo.countByFilters(testUserId, {});

      expect(count).toBe(15);
    });
  });
});
