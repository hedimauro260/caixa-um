import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { CreateCategoryInput, CategoryOutput } from "../../dto/category-dto.js";
import { createCategory } from "@caixa-1/domain";
import { CategoryNameAlreadyExists } from "../../errors/application-errors.js";
import { createCategoryId, CategoryNotFound } from "@caixa-1/domain";
import type { CategoryId } from "@caixa-1/domain";

export class CreateCategory {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    input: CreateCategoryInput,
  ): Promise<CategoryOutput> {
    const created = await this.unitOfWork.execute(async (repos) => {
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      if (input.parentId) {
        const parent = await categoryRepo.findById(input.parentId, context.userId);
        if (!parent) {
          throw new CategoryNotFound(input.parentId);
        }
      }

      const exists = await categoryRepo.existsByName(
        context.userId,
        input.name,
        input.parentId,
      );
      if (exists) {
        throw new CategoryNameAlreadyExists(input.name);
      }

      const category = createCategory({
        id: createCategoryId(crypto.randomUUID()),
        userId: context.userId,
        name: input.name,
        parentId: input.parentId as CategoryId | null | undefined,
        description: input.description,
        color: input.color,
        icon: input.icon,
      });

      await categoryRepo.save(category);
      return category;
    });

    return {
      id: created.id,
      name: created.name,
      parentId: created.parentId,
      description: created.description,
      color: created.color,
      icon: created.icon,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
