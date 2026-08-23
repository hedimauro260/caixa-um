import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { UpdateCategoryInput, CategoryOutput } from "../../dto/category-dto.js";
import { renameCategory } from "@caixa-1/domain";
import { CategoryNameAlreadyExists } from "../../errors/application-errors.js";
import { CategoryNotFound } from "@caixa-1/domain";

export class UpdateCategory {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    categoryId: string,
    input: UpdateCategoryInput,
  ): Promise<CategoryOutput> {
    const updated = await this.unitOfWork.execute(async (repos) => {
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const category = await categoryRepo.findById(categoryId, context.userId);
      if (!category) {
        throw new CategoryNotFound(categoryId);
      }

      if (input.name) {
        const exists = await categoryRepo.existsByName(
          context.userId,
          input.name,
          category.parentId,
        );
        if (exists) {
          throw new CategoryNameAlreadyExists(input.name);
        }
      }

      let result = category;
      if (input.name) {
        result = renameCategory(result, input.name);
      }
      if (input.description !== undefined) {
        result = { ...result, description: input.description, updatedAt: new Date() };
      }
      if (input.color !== undefined) {
        result = { ...result, color: input.color, updatedAt: new Date() };
      }
      if (input.icon !== undefined) {
        result = { ...result, icon: input.icon, updatedAt: new Date() };
      }

      await categoryRepo.update(result);
      return result;
    });

    return {
      id: updated.id,
      name: updated.name,
      parentId: updated.parentId,
      description: updated.description,
      color: updated.color,
      icon: updated.icon,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
