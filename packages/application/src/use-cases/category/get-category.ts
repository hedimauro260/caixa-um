import type { ApplicationContext } from "../../context.js";
import type { CategoryRepository } from "../../repositories/category-repository.js";
import type { CategoryOutput, CategoryTreeOutput } from "../../dto/category-dto.js";
import { CategoryNotFound } from "@caixa-1/domain";

export class GetCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    context: ApplicationContext,
    categoryId: string,
  ): Promise<CategoryOutput> {
    const category = await this.categoryRepository.findById(
      categoryId,
      context.userId,
    );

    if (!category) {
      throw new CategoryNotFound(categoryId);
    }

    return {
      id: category.id,
      name: category.name,
      parentId: category.parentId,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

export class ListCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(context: ApplicationContext): Promise<CategoryTreeOutput[]> {
    const allCategories = await this.categoryRepository.findAllByUserId(
      context.userId,
    );

    const categoryMap = new Map<string, CategoryTreeOutput>();
    const roots: CategoryTreeOutput[] = [];

    for (const cat of allCategories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        isActive: cat.isActive,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
        children: [],
      });
    }

    for (const node of categoryMap.values()) {
      if (node.parentId) {
        const parent = categoryMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
