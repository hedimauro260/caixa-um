import { describe, it, expect } from "vitest";
import {
  createMoney,
  add,
  subtract,
  compare,
  isPositive,
  isZero,
  isNegative,
  isGreaterOrEqual,
} from "../money/money.js";
import {
  InvalidMoneyAmount,
  MoneyPrecisionExceeded,
  IncompatibleCurrencyOperation,
} from "../errors/money-errors.js";

describe("Money", () => {
  describe("createMoney", () => {
    it("should create money from integer string", () => {
      const money = createMoney("100", "AOA");
      expect(money.amount).toBe("100.00");
      expect(money.currency).toBe("AOA");
    });

    it("should normalize one decimal place", () => {
      const money = createMoney("100.5", "USD");
      expect(money.amount).toBe("100.50");
    });

    it("should keep two decimal places", () => {
      const money = createMoney("100.55", "EUR");
      expect(money.amount).toBe("100.55");
    });

    it("should trim whitespace", () => {
      const money = createMoney("  100  ", "AOA");
      expect(money.amount).toBe("100.00");
    });

    it("should handle zero", () => {
      const money = createMoney("0", "AOA");
      expect(money.amount).toBe("0.00");
    });

    it("should handle negative amounts", () => {
      const money = createMoney("-50", "AOA");
      expect(money.amount).toBe("-50.00");
    });

    it("should handle negative with decimals", () => {
      const money = createMoney("-50.5", "AOA");
      expect(money.amount).toBe("-50.50");
    });

    it("should throw InvalidMoneyAmount for non-numeric", () => {
      expect(() => createMoney("abc", "AOA")).toThrow(InvalidMoneyAmount);
    });

    it("should throw InvalidMoneyAmount for empty string", () => {
      expect(() => createMoney("", "AOA")).toThrow(InvalidMoneyAmount);
    });

    it("should throw InvalidMoneyAmount for letters", () => {
      expect(() => createMoney("12.34.56", "AOA")).toThrow(InvalidMoneyAmount);
    });

    it("should throw InvalidMoneyAmount for 3+ decimals (regex catches first)", () => {
      expect(() => createMoney("100.123", "AOA")).toThrow(InvalidMoneyAmount);
    });
  });

  describe("add", () => {
    it("should add two positive amounts", () => {
      const a = createMoney("100.50", "AOA");
      const b = createMoney("200.25", "AOA");
      const result = add(a, b);
      expect(result.amount).toBe("300.75");
    });

    it("should add positive and negative", () => {
      const a = createMoney("100", "AOA");
      const b = createMoney("-30", "AOA");
      const result = add(a, b);
      expect(result.amount).toBe("70.00");
    });

    it("should add two negatives", () => {
      const a = createMoney("-100", "AOA");
      const b = createMoney("-50", "AOA");
      const result = add(a, b);
      expect(result.amount).toBe("-150.00");
    });

    it("should throw IncompatibleCurrencyOperation for different currencies", () => {
      const a = createMoney("100", "AOA");
      const b = createMoney("100", "USD");
      expect(() => add(a, b)).toThrow(IncompatibleCurrencyOperation);
    });
  });

  describe("subtract", () => {
    it("should subtract two amounts", () => {
      const a = createMoney("300", "AOA");
      const b = createMoney("100", "AOA");
      const result = subtract(a, b);
      expect(result.amount).toBe("200.00");
    });

    it("should produce negative result", () => {
      const a = createMoney("100", "AOA");
      const b = createMoney("200", "AOA");
      const result = subtract(a, b);
      expect(result.amount).toBe("-100.00");
    });

    it("should handle decimals correctly", () => {
      const a = createMoney("100.75", "AOA");
      const b = createMoney("50.25", "AOA");
      const result = subtract(a, b);
      expect(result.amount).toBe("50.50");
    });
  });

  describe("compare", () => {
    it("should return -1 when a < b", () => {
      expect(compare(createMoney("100", "AOA"), createMoney("200", "AOA"))).toBe(-1);
    });

    it("should return 0 when a === b", () => {
      expect(compare(createMoney("100", "AOA"), createMoney("100", "AOA"))).toBe(0);
    });

    it("should return 1 when a > b", () => {
      expect(compare(createMoney("200", "AOA"), createMoney("100", "AOA"))).toBe(1);
    });

    it("should compare decimals correctly", () => {
      expect(compare(createMoney("100.50", "AOA"), createMoney("100.55", "AOA"))).toBe(-1);
    });
  });

  describe("isPositive", () => {
    it("should return true for positive amount", () => {
      expect(isPositive(createMoney("100", "AOA"))).toBe(true);
    });

    it("should return false for zero", () => {
      expect(isPositive(createMoney("0", "AOA"))).toBe(false);
    });

    it("should return false for negative", () => {
      expect(isPositive(createMoney("-100", "AOA"))).toBe(false);
    });
  });

  describe("isZero", () => {
    it("should return true for zero", () => {
      expect(isZero(createMoney("0", "AOA"))).toBe(true);
    });

    it("should return false for non-zero", () => {
      expect(isZero(createMoney("100", "AOA"))).toBe(false);
    });
  });

  describe("isNegative", () => {
    it("should return true for negative", () => {
      expect(isNegative(createMoney("-100", "AOA"))).toBe(true);
    });

    it("should return false for zero", () => {
      expect(isNegative(createMoney("0", "AOA"))).toBe(false);
    });

    it("should return false for positive", () => {
      expect(isNegative(createMoney("100", "AOA"))).toBe(false);
    });
  });

  describe("isGreaterOrEqual", () => {
    it("should return true when a > b", () => {
      expect(isGreaterOrEqual(createMoney("200", "AOA"), createMoney("100", "AOA"))).toBe(true);
    });

    it("should return true when a === b", () => {
      expect(isGreaterOrEqual(createMoney("100", "AOA"), createMoney("100", "AOA"))).toBe(true);
    });

    it("should return false when a < b", () => {
      expect(isGreaterOrEqual(createMoney("50", "AOA"), createMoney("100", "AOA"))).toBe(false);
    });
  });
});
