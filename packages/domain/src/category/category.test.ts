import { describe, it, expect } from "vitest";
import {
  createCategory,
  renameCategory,
  archiveCategory,
  reactivateCategory,
  deleteCategory,
} from "../category/category.js";
import { createCategoryId } from "../types/ids.js";
import {
  CategoryNameRequired,
  CategoryInvalidName,
  CategorySelfParent,
  CategoryCannotDeleteArchived,
  CategoryCannotDeleteSoftDeleted,
  CategoryCannotReactivateWithArchivedParent,
  CategoryCannotReactivateWithDeletedParent,
} from "../errors/category-errors.js";
import type { Category } from "../category/category.js";

const CAT_ID_1 = createCategoryId("00000000-0000-0000-0000-000000000001");
const CAT_ID_2 = createCategoryId("00000000-0000-0000-0000-000000000002");

function makeCategory(overrides?: Partial<Category>): Category {
  const base: Category = {
    id: CAT_ID_1,
    userId: "user-1",
    name: "Alimentacao",
    parentId: null,
    description: null,
    color: null,
    icon: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  return { ...base, ...overrides };
}

function createValidCategory(overrides?: Parameters<typeof createCategory>[0]) {
  return createCategory({
    id: CAT_ID_1,
    userId: "user-1",
    name: "Alimentacao",
    ...overrides,
  });
}

describe("Category", () => {
  describe("createCategory", () => {
    it("should create category with valid data", () => {
      const cat = createValidCategory();
      expect(cat.name).toBe("Alimentacao");
      expect(cat.parentId).toBeNull();
      expect(cat.isActive).toBe(true);
      expect(cat.deletedAt).toBeNull();
    });

    it("should trim name", () => {
      const cat = createValidCategory({ name: "  Alimentacao  " });
      expect(cat.name).toBe("Alimentacao");
    });

    it("should throw CategoryNameRequired for empty name", () => {
      expect(() => createValidCategory({ name: "" })).toThrow(CategoryNameRequired);
    });

    it("should throw CategoryNameRequired for whitespace name", () => {
      expect(() => createValidCategory({ name: "   " })).toThrow(CategoryNameRequired);
    });

    it("should throw CategoryInvalidName for name > 50 chars", () => {
      expect(() => createValidCategory({ name: "A".repeat(51) })).toThrow(CategoryInvalidName);
    });

    it("should allow name with exactly 50 chars", () => {
      const cat = makeCategory({ name: "A".repeat(50) });
      expect(cat.name).toHaveLength(50);
    });

    it("should throw CategorySelfParent when parentId === id", () => {
      expect(() =>
        createCategory({
          id: CAT_ID_1,
          userId: "user-1",
          name: "Test",
          parentId: CAT_ID_1,
        }),
      ).toThrow(CategorySelfParent);
    });

    it("should set parentId when different from id", () => {
      const cat = createCategory({
        id: CAT_ID_1,
        userId: "user-1",
        name: "Filho",
        parentId: CAT_ID_2,
      });
      expect(cat.parentId).toBe(CAT_ID_2);
    });

    it("should set defaults for optional fields", () => {
      const cat = makeCategory();
      expect(cat.description).toBeNull();
      expect(cat.color).toBeNull();
      expect(cat.icon).toBeNull();
    });
  });

  describe("renameCategory", () => {
    it("should rename category", () => {
      const cat = makeCategory();
      const renamed = renameCategory(cat, "Saude");
      expect(renamed.name).toBe("Saude");
    });

    it("should trim new name", () => {
      const cat = makeCategory();
      const renamed = renameCategory(cat, "  Saude  ");
      expect(renamed.name).toBe("Saude");
    });

    it("should throw CategoryNameRequired for empty name", () => {
      const cat = makeCategory();
      expect(() => renameCategory(cat, "")).toThrow(CategoryNameRequired);
    });
  });

  describe("archiveCategory", () => {
    it("should archive active category", () => {
      const cat = makeCategory();
      const archived = archiveCategory(cat);
      expect(archived.isActive).toBe(false);
    });

    it("should throw CategoryCannotDeleteArchived for already archived", () => {
      const cat = makeCategory({ isActive: false });
      expect(() => archiveCategory(cat)).toThrow(CategoryCannotDeleteArchived);
    });
  });

  describe("reactivateCategory", () => {
    it("should reactivate archived category without parent", () => {
      const cat = makeCategory({ isActive: false });
      const reactivated = reactivateCategory(cat, null);
      expect(reactivated.isActive).toBe(true);
    });

    it("should return same category if already active", () => {
      const cat = makeCategory({ isActive: true });
      const result = reactivateCategory(cat, null);
      expect(result).toBe(cat);
    });

    it("should throw CategoryCannotDeleteSoftDeleted for deleted category", () => {
      const cat = makeCategory({
        isActive: false,
        deletedAt: new Date(),
      });
      expect(() => reactivateCategory(cat, null)).toThrow(
        CategoryCannotDeleteSoftDeleted,
      );
    });

    it("should throw CategoryCannotReactivateWithArchivedParent", () => {
      const cat = makeCategory({ isActive: false });
      const parent = makeCategory({
        id: CAT_ID_2,
        isActive: false,
      });
      expect(() => reactivateCategory(cat, parent)).toThrow(
        CategoryCannotReactivateWithArchivedParent,
      );
    });

    it("should throw CategoryCannotReactivateWithDeletedParent", () => {
      const cat = makeCategory({ isActive: false });
      const parent = makeCategory({
        id: CAT_ID_2,
        isActive: false,
        deletedAt: new Date(),
      });
      expect(() => reactivateCategory(cat, parent)).toThrow(
        CategoryCannotReactivateWithDeletedParent,
      );
    });

    it("should reactivate when parent is active", () => {
      const cat = makeCategory({ isActive: false });
      const parent = makeCategory({
        id: CAT_ID_2,
        isActive: true,
      });
      const reactivated = reactivateCategory(cat, parent);
      expect(reactivated.isActive).toBe(true);
    });
  });

  describe("deleteCategory", () => {
    it("should soft delete active category", () => {
      const cat = makeCategory();
      const deleted = deleteCategory(cat);
      expect(deleted.isActive).toBe(false);
      expect(deleted.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw CategoryCannotDeleteSoftDeleted for already deleted", () => {
      const cat = makeCategory({ deletedAt: new Date() });
      expect(() => deleteCategory(cat)).toThrow(CategoryCannotDeleteSoftDeleted);
    });
  });
});
