import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import { archiveCategory } from "@caixa-1/domain";
import { CategoryNotFound } from "@caixa-1/domain";

export class ArchiveCategory {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    categoryId: string,
  ): Promise<{ success: true }> {
    await this.unitOfWork.execute(async (repos) => {
      const categoryRepo = repos.categoryRepository as CategoryRepository;

      const category = await categoryRepo.findById(categoryId, context.userId);
      if (!category) {
        throw new CategoryNotFound(categoryId);
      }

      const archived = archiveCategory(category);
      await categoryRepo.update(archived);
    });

    return { success: true };
  }
}
