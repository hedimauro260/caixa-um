import { describe, it, expect } from "vitest";
import { calculateBalance, filterEntriesBeforeDate } from "../balance/balance-service.js";
import { createMoney } from "../money/money.js";
import type { FinancialEntry } from "../types/financial-entry.js";
import type { AccountId, EconomicDate } from "@caixa-1/domain";

const A1 = "acc-001" as AccountId;
const A2 = "acc-002" as AccountId;

function entry(o: Partial<FinancialEntry> & { accountId: AccountId }): FinancialEntry {
  return {
    id: o.id ?? "e1",
    accountId: o.accountId,
    direction: o.direction ?? "CREDIT",
    amount: o.amount ?? createMoney("100", "AOA"),
    date: o.date ?? ("2025-06-15" as EconomicDate),
    createdAt: o.createdAt ?? new Date("2025-06-15T10:00:00Z"),
  };
}

describe("BalanceService", () => {
  describe("calculateBalance", () => {
    it("should return initial balance when no entries", () => {
      const r = calculateBalance({ initialBalance: createMoney("1000", "AOA"), accountType: "BANK", entries: [] });
      expect(r.finalBalance.amount).toBe("1000.00");
      expect(r.valid).toBe(true);
      expect(r.firstViolation).toBeNull();
    });

    it("should add CREDIT entries", () => {
      const r = calculateBalance({
        initialBalance: createMoney("500", "AOA"), accountType: "BANK",
        entries: [
          entry({ accountId: A1, direction: "CREDIT", amount: createMoney("200", "AOA") }),
          entry({ id: "e2", accountId: A1, direction: "CREDIT", amount: createMoney("300", "AOA") }),
        ],
      });
      expect(r.finalBalance.amount).toBe("1000.00");
    });

    it("should subtract DEBIT entries", () => {
      const r = calculateBalance({
        initialBalance: createMoney("1000", "AOA"), accountType: "BANK",
        entries: [entry({ accountId: A1, direction: "DEBIT", amount: createMoney("300", "AOA") })],
      });
      expect(r.finalBalance.amount).toBe("700.00");
    });

    it("should handle mixed CREDIT and DEBIT", () => {
      const r = calculateBalance({
        initialBalance: createMoney("1000", "AOA"), accountType: "BANK",
        entries: [
          entry({ accountId: A1, direction: "CREDIT", amount: createMoney("500", "AOA") }),
          entry({ id: "e2", accountId: A1, direction: "DEBIT", amount: createMoney("200", "AOA") }),
        ],
      });
      expect(r.finalBalance.amount).toBe("1300.00");
    });

    it("should sort entries by date ascending", () => {
      const r = calculateBalance({
        initialBalance: createMoney("0", "AOA"), accountType: "BANK",
        entries: [
          entry({ id: "later", accountId: A1, direction: "CREDIT", amount: createMoney("200", "AOA"), date: "2025-06-20" as EconomicDate }),
          entry({ id: "earlier", accountId: A1, direction: "DEBIT", amount: createMoney("100", "AOA"), date: "2025-06-10" as EconomicDate }),
        ],
      });
      expect(r.finalBalance.amount).toBe("100.00");
    });

    it("should detect CASH violation when balance goes negative", () => {
      const r = calculateBalance({
        initialBalance: createMoney("100", "AOA"), accountType: "CASH",
        entries: [entry({ accountId: A1, direction: "DEBIT", amount: createMoney("200", "AOA") })],
      });
      expect(r.valid).toBe(false);
      expect(r.firstViolation).not.toBeNull();
      expect(r.firstViolation!.balanceAtViolation.amount).toBe("-100.00");
    });

    it("should not detect violation for BANK with negative balance", () => {
      const r = calculateBalance({
        initialBalance: createMoney("100", "AOA"), accountType: "BANK",
        entries: [entry({ accountId: A1, direction: "DEBIT", amount: createMoney("200", "AOA") })],
      });
      expect(r.valid).toBe(true);
      expect(r.firstViolation).toBeNull();
    });

    it("should detect only first CASH violation", () => {
      const r = calculateBalance({
        initialBalance: createMoney("50", "AOA"), accountType: "CASH",
        entries: [
          entry({ id: "first", accountId: A1, direction: "DEBIT", amount: createMoney("100", "AOA"), date: "2025-06-10" as EconomicDate }),
          entry({ id: "second", accountId: A1, direction: "DEBIT", amount: createMoney("50", "AOA"), date: "2025-06-20" as EconomicDate }),
        ],
      });
      expect(r.valid).toBe(false);
      expect(r.firstViolation!.accountId).toBe(A1);
    });

    it("should handle CASH with zero balance (valid)", () => {
      const r = calculateBalance({
        initialBalance: createMoney("100", "AOA"), accountType: "CASH",
        entries: [entry({ accountId: A1, direction: "DEBIT", amount: createMoney("100", "AOA") })],
      });
      expect(r.valid).toBe(true);
      expect(r.finalBalance.amount).toBe("0.00");
    });
  });

  describe("filterEntriesBeforeDate", () => {
    it("should filter entries before date", () => {
      const entries: FinancialEntry[] = [
        entry({ accountId: A1, date: "2025-06-10" as EconomicDate }),
        entry({ id: "e2", accountId: A1, date: "2025-06-15" as EconomicDate }),
        entry({ id: "e3", accountId: A1, date: "2025-06-20" as EconomicDate }),
      ];
      const filtered = filterEntriesBeforeDate(entries, "2025-06-15" as EconomicDate);
      expect(filtered).toHaveLength(2);
    });

    it("should include entries on the exact date", () => {
      const entries: FinancialEntry[] = [
        entry({ accountId: A1, date: "2025-06-15" as EconomicDate }),
      ];
      const filtered = filterEntriesBeforeDate(entries, "2025-06-15" as EconomicDate);
      expect(filtered).toHaveLength(1);
    });

    it("should return empty when no entries match", () => {
      const entries: FinancialEntry[] = [
        entry({ accountId: A1, date: "2025-06-20" as EconomicDate }),
      ];
      const filtered = filterEntriesBeforeDate(entries, "2025-06-15" as EconomicDate);
      expect(filtered).toHaveLength(0);
    });
  });
});
