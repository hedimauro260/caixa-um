import type { Category } from "@caixa-1/domain";

export interface CategoryRepository {
  findById(categoryId: string, userId: string): Promise<Category | null>;
  findByIdIncludingDeleted(
    categoryId: string,
    userId: string,
  ): Promise<Category | null>;
  existsByName(
    userId: string,
    name: string,
    parentId?: string | null,
  ): Promise<boolean>;
  findAncestors(categoryId: string, userId: string): Promise<Category[]>;
  findAllByUserId(userId: string): Promise<Category[]>;
  save(category: Category): Promise<void>;
  update(category: Category): Promise<void>;
}
