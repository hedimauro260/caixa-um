import { eq, and, isNull, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { categories } from "../schema/categories";
import {
  toCategoryDomain,
  toCategoryPersistence,
} from "../mappers/category-mapper";
import type { CategoryRepository } from "@caixa-1/application";
import type { Category } from "@caixa-1/domain";

export class DrizzleCategoryRepository implements CategoryRepository {
  private readonly db: typeof defaultDb;

  constructor(dbInstance?: typeof defaultDb) {
    this.db = dbInstance ?? defaultDb;
  }

  async findById(
    categoryId: string,
    userId: string,
  ): Promise<Category | null> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId),
          isNull(categories.deletedAt),
        ),
      )
      .limit(1);

    return row ? toCategoryDomain(row) : null;
  }

  async findByIdIncludingDeleted(
    categoryId: string,
    userId: string,
  ): Promise<Category | null> {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(
        and(eq(categories.id, categoryId), eq(categories.userId, userId)),
      )
      .limit(1);

    return row ? toCategoryDomain(row) : null;
  }

  async existsByName(
    userId: string,
    name: string,
    parentId?: string | null,
  ): Promise<boolean> {
    const conditions = [
      eq(categories.userId, userId),
      sql`lower(trim(${categories.name})) = lower(trim(${name}))`,
      isNull(categories.deletedAt),
    ];

    if (parentId === null || parentId === undefined) {
      conditions.push(isNull(categories.parentId));
    } else {
      conditions.push(eq(categories.parentId, parentId));
    }

    const [row] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(and(...conditions))
      .limit(1);

    return row !== undefined;
  }

  async findAncestors(
    categoryId: string,
    userId: string,
  ): Promise<Category[]> {
    const result: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId !== null) {
      const [row] = await this.db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, currentId),
            eq(categories.userId, userId),
          ),
        )
        .limit(1);

      if (!row) break;

      result.push(toCategoryDomain(row));
      currentId = row.parentId;
    }

    return result;
  }

  async save(category: Category): Promise<void> {
    await this.db.insert(categories).values(toCategoryPersistence(category));
  }

  async update(category: Category): Promise<void> {
    const persistence = toCategoryPersistence(category);
    await this.db
      .update(categories)
      .set({
        name: persistence.name,
        parentId: persistence.parentId,
        description: persistence.description,
        color: persistence.color,
        icon: persistence.icon,
        isActive: persistence.isActive,
        updatedAt: persistence.updatedAt,
        deletedAt: persistence.deletedAt,
      })
      .where(eq(categories.id, persistence.id));
  }

  async findAllByUserId(userId: string): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          isNull(categories.deletedAt),
        ),
      )
      .orderBy(categories.name);

    return rows.map(toCategoryDomain);
  }
}
