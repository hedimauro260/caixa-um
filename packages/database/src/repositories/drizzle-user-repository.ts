import { eq } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { users } from "../schema/users";
import { toUserDomain, toUserPersistence } from "../mappers/user-mapper";
import type { UserRepository } from "@caixa-1/application";
import type { User } from "@caixa-1/domain";

export class DrizzleUserRepository implements UserRepository {
  private readonly db: typeof defaultDb;

  constructor(dbInstance?: typeof defaultDb) {
    this.db = dbInstance ?? defaultDb;
  }

  async findById(userId: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return row ? toUserDomain(row) : null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return row ? toUserDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    await this.db.insert(users).values(toUserPersistence(user));
  }

  async update(user: User): Promise<void> {
    const persistence = toUserPersistence(user);
    await this.db
      .update(users)
      .set({
        email: persistence.email,
        name: persistence.name,
        baseCurrency: persistence.baseCurrency,
        updatedAt: persistence.updatedAt,
        deletedAt: persistence.deletedAt,
      })
      .where(eq(users.id, persistence.id));
  }
}
