import { describe, it, expect } from "vitest";
import {
  isValidEconomicDate,
  createEconomicDate,
  compareEconomicDate,
} from "../types/economic-date.js";
import { DomainError } from "../errors/domain-error.js";

describe("EconomicDate", () => {
  describe("isValidEconomicDate", () => {
    it("should return true for valid date", () => {
      expect(isValidEconomicDate("2025-01-15")).toBe(true);
    });

    it("should return true for leap year", () => {
      expect(isValidEconomicDate("2024-02-29")).toBe(true);
    });

    it("should return false for non-leap year", () => {
      expect(isValidEconomicDate("2025-02-29")).toBe(false);
    });

    it("should return false for month 13", () => {
      expect(isValidEconomicDate("2025-13-01")).toBe(false);
    });

    it("should return false for day 32", () => {
      expect(isValidEconomicDate("2025-01-32")).toBe(false);
    });

    it("should return false for wrong format", () => {
      expect(isValidEconomicDate("15-01-2025")).toBe(false);
    });

    it("should return false for incomplete date", () => {
      expect(isValidEconomicDate("2025-01")).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isValidEconomicDate("")).toBe(false);
    });

    it("should return false for day 0", () => {
      expect(isValidEconomicDate("2025-01-00")).toBe(false);
    });

    it("should return false for month 0", () => {
      expect(isValidEconomicDate("2025-00-01")).toBe(false);
    });
  });

  describe("createEconomicDate", () => {
    it("should create valid date", () => {
      const date = createEconomicDate("2025-01-15");
      expect(date).toBe("2025-01-15");
    });

    it("should throw DomainError for invalid date", () => {
      expect(() => createEconomicDate("2025-13-01")).toThrow(DomainError);
    });

    it("should throw DomainError for empty string", () => {
      expect(() => createEconomicDate("")).toThrow(DomainError);
    });
  });

  describe("compareEconomicDate", () => {
    it("should return -1 when a < b", () => {
      expect(compareEconomicDate("2025-01-01", "2025-01-02")).toBe(-1);
    });

    it("should return 0 when a === b", () => {
      expect(compareEconomicDate("2025-01-01", "2025-01-01")).toBe(0);
    });

    it("should return 1 when a > b", () => {
      expect(compareEconomicDate("2025-01-02", "2025-01-01")).toBe(1);
    });

    it("should compare across months", () => {
      expect(compareEconomicDate("2025-01-31", "2025-02-01")).toBe(-1);
    });

    it("should compare across years", () => {
      expect(compareEconomicDate("2024-12-31", "2025-01-01")).toBe(-1);
    });
  });
});
