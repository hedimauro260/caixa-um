import type { CategoryId } from "../types/ids.js";
import {
  CategoryNameRequired,
  CategoryInvalidName,
  CategorySelfParent,
  CategoryCannotDeleteSelfParent,
  CategoryCannotDeleteArchived,
  CategoryCannotDeleteSoftDeleted,
  CategoryCannotReactivateWithArchivedParent,
  CategoryCannotReactivateWithDeletedParent,
} from "../errors/category-errors.js";

export interface Category {
  readonly id: CategoryId;
  readonly userId: string;
  readonly name: string;
  readonly parentId: CategoryId | null;
  readonly description: string | null;
  readonly color: string | null;
  readonly icon: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new CategoryNameRequired();
  }
  if (name.trim().length > 50) {
    throw new CategoryInvalidName(name);
  }
}

export interface CreateCategoryInput {
  id: CategoryId;
  userId: string;
  name: string;
  parentId?: CategoryId | null;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
}

export function createCategory(input: CreateCategoryInput): Category {
  validateName(input.name);

  if (input.parentId && input.parentId === input.id) {
    throw new CategorySelfParent();
  }

  const now = new Date();

  return {
    id: input.id,
    userId: input.userId,
    name: input.name.trim(),
    parentId: input.parentId ?? null,
    description: input.description ?? null,
    color: input.color ?? null,
    icon: input.icon ?? null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function renameCategory(category: Category, newName: string): Category {
  validateName(newName);

  return {
    ...category,
    name: newName.trim(),
    updatedAt: new Date(),
  };
}

export function archiveCategory(category: Category): Category {
  if (!category.isActive) {
    throw new CategoryCannotDeleteArchived();
  }

  return {
    ...category,
    isActive: false,
    updatedAt: new Date(),
  };
}

export function reactivateCategory(
  category: Category,
  parentCategory: Category | null,
): Category {
  if (category.isActive) {
    return category;
  }

  if (category.deletedAt !== null) {
    throw new CategoryCannotDeleteSoftDeleted();
  }

  if (parentCategory) {
    if (parentCategory.deletedAt !== null) {
      throw new CategoryCannotReactivateWithDeletedParent();
    }
    if (!parentCategory.isActive) {
      throw new CategoryCannotReactivateWithArchivedParent();
    }
  }

  return {
    ...category,
    isActive: true,
    updatedAt: new Date(),
  };
}

export function deleteCategory(category: Category): Category {
  if (category.deletedAt !== null) {
    throw new CategoryCannotDeleteSoftDeleted();
  }

  return {
    ...category,
    isActive: false,
    deletedAt: new Date(),
    updatedAt: new Date(),
  };
}
