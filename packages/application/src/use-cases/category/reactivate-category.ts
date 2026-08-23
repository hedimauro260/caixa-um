import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import { reactivateCategory } from "@caixa-1/domain";
import { CategoryNotFound } from "@caixa-1/domain";

export class ReactivateCategory {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    categoryId: string,
  ): Promise<{ success: true }> {
    await this.unitOfWork.execute(async (repos) => {
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const category = await categoryRepo.findByIdIncludingDeleted(
        categoryId,
        context.userId,
      );
      if (!category) {
        throw new CategoryNotFound(categoryId);
      }

      const parentCategory = category.parentId
        ? await categoryRepo.findByIdIncludingDeleted(category.parentId, context.userId)
        : null;

      const reactivated = reactivateCategory(category, parentCategory);
      await categoryRepo.update(reactivated);
    });

    return { success: true };
  }
}
