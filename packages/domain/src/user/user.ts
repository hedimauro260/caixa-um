import type { CurrencyCode } from "../types/currency.js";
import type { UserId } from "../types/ids.js";
import { UserNameRequired, UserInvalidName } from "../errors/user-errors.js";

export interface User {
  readonly id: UserId;
  readonly clerkId: string;
  readonly email: string;
  readonly name: string | null;
  readonly baseCurrency: CurrencyCode;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateUserInput {
  id: UserId;
  clerkId: string;
  email: string;
  name?: string | null;
  baseCurrency?: CurrencyCode;
}

function validateName(name: string | null | undefined): void {
  if (name !== null && name !== undefined) {
    if (name.trim().length === 0) {
      throw new UserNameRequired();
    }
    if (name.trim().length > 100) {
      throw new UserInvalidName(name);
    }
  }
}

export function createUser(input: CreateUserInput): User {
  validateName(input.name);

  const now = new Date();

  return {
    id: input.id,
    clerkId: input.clerkId,
    email: input.email,
    name: input.name?.trim() ?? null,
    baseCurrency: input.baseCurrency ?? "AOA",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function updateUserProfile(
  user: User,
  updates: { name?: string; email?: string },
): User {
  if (updates.name !== undefined) {
    validateName(updates.name);
  }

  return {
    ...user,
    name: updates.name !== undefined ? updates.name.trim() : user.name,
    email: updates.email ?? user.email,
    updatedAt: new Date(),
  };
}
