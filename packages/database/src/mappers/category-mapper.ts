import { categories } from "../schema/categories";
import type { Category } from "@caixa-1/domain";

type CategoryRow = typeof categories.$inferSelect;

export function toCategoryDomain(row: CategoryRow): Category {
  return {
    id: row.id as Category["id"],
    userId: row.userId,
    name: row.name,
    parentId: (row.parentId ?? null) as Category["parentId"],
    description: row.description,
    color: row.color,
    icon: row.icon,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export function toCategoryPersistence(category: Category) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    parentId: category.parentId,
    description: category.description,
    color: category.color,
    icon: category.icon,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    deletedAt: category.deletedAt,
  };
}
