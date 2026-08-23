export interface CreateCategoryInput {
  readonly name: string;
  readonly parentId?: string | null;
  readonly description?: string | null;
  readonly color?: string | null;
  readonly icon?: string | null;
}

export interface UpdateCategoryInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly color?: string | null;
  readonly icon?: string | null;
}

export interface CategoryOutput {
  readonly id: string;
  readonly name: string;
  readonly parentId: string | null;
  readonly description: string | null;
  readonly color: string | null;
  readonly icon: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CategoryTreeOutput extends CategoryOutput {
  readonly children: CategoryTreeOutput[];
}
