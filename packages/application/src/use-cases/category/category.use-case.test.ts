import { describe, it, expect } from "vitest";
import { CreateCategory } from "./create-category.js";
import { GetCategory, ListCategories } from "./get-category.js";
import { UpdateCategory } from "./update-category.js";
import { ArchiveCategory } from "./archive-category.js";
import { DeleteCategory } from "./delete-category.js";
import { ReactivateCategory } from "./reactivate-category.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { ApplicationContext } from "../../context.js";
import type { Category } from "@caixa-1/domain";
import { createCategoryId } from "@caixa-1/domain";
import { CategoryNotFound } from "@caixa-1/domain";
import { CategoryNameAlreadyExists } from "../../errors/application-errors.js";

const ctx: ApplicationContext = { userId: "user-1", today: "2025-06-15" };
const CAT_ID = createCategoryId("00000000-0000-0000-0000-000000000001");

function makeCategory(overrides?: Partial<Category>): Category {
  return {
    id: CAT_ID,
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
    ...overrides,
  };
}

function createMockCategoryRepo(overrides?: Partial<CategoryRepository>): CategoryRepository {
  return {
    findById: async () => makeCategory(),
    findByIdIncludingDeleted: async () => makeCategory(),
    findAncestors: async () => [],
    findAllByUserId: async () => [makeCategory()],
    existsByName: async () => false,
    save: async () => {},
    update: async () => {},
    ...overrides,
  };
}

function createMockUnitOfWork(repo: CategoryRepository): UnitOfWork {
  return {
    execute: async (fn) => {
      return fn({
        accountRepository: {} as any,
        categoryRepository: repo,
        transactionRepository: {} as any,
      });
    },
  };
}

describe("Category Use Cases", () => {
  describe("CreateCategory", () => {
    it("should create category", async () => {
      const repo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new CreateCategory(uow);

      const result = await useCase.execute(ctx, { name: "Alimentacao" });
      expect(result.name).toBe("Alimentacao");
    });

    it("should throw CategoryNameAlreadyExists when name exists", async () => {
      const repo = createMockCategoryRepo({ existsByName: async () => true });
      const uow = createMockUnitOfWork(repo);
      const useCase = new CreateCategory(uow);

      await expect(useCase.execute(ctx, { name: "Alimentacao" })).rejects.toThrow(
        CategoryNameAlreadyExists,
      );
    });
  });

  describe("GetCategory", () => {
    it("should return category", async () => {
      const repo = createMockCategoryRepo();
      const useCase = new GetCategory(repo);
      const result = await useCase.execute(ctx, CAT_ID);
      expect(result.name).toBe("Alimentacao");
    });

    it("should throw CategoryNotFound", async () => {
      const repo = createMockCategoryRepo({ findById: async () => null });
      const useCase = new GetCategory(repo);
      await expect(useCase.execute(ctx, CAT_ID)).rejects.toThrow(CategoryNotFound);
    });
  });

  describe("ListCategories", () => {
    it("should return categories tree", async () => {
      const repo = createMockCategoryRepo();
      const useCase = new ListCategories(repo);
      const result = await useCase.execute(ctx);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no categories", async () => {
      const repo = createMockCategoryRepo({ findAllByUserId: async () => [] });
      const useCase = new ListCategories(repo);
      const result = await useCase.execute(ctx);
      expect(result).toHaveLength(0);
    });
  });

  describe("UpdateCategory", () => {
    it("should update category name", async () => {
      const repo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new UpdateCategory(uow);
      const result = await useCase.execute(ctx, CAT_ID, { name: "Saude" });
      expect(result.name).toBe("Saude");
    });
  });

  describe("ArchiveCategory", () => {
    it("should archive category", async () => {
      const repo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new ArchiveCategory(uow);
      const result = await useCase.execute(ctx, CAT_ID);
      expect(result.success).toBe(true);
    });
  });

  describe("DeleteCategory", () => {
    it("should soft delete category", async () => {
      const repo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new DeleteCategory(uow);
      const result = await useCase.execute(ctx, CAT_ID);
      expect(result.success).toBe(true);
    });
  });

  describe("ReactivateCategory", () => {
    it("should reactivate category", async () => {
      const repo = createMockCategoryRepo();
      const uow = createMockUnitOfWork(repo);
      const useCase = new ReactivateCategory(uow);
      const result = await useCase.execute(ctx, CAT_ID);
      expect(result.success).toBe(true);
    });
  });
});
