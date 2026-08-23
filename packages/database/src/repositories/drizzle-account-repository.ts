import { eq, and, isNull, sql } from "drizzle-orm";
import { db as defaultDb } from "../client";
import { accounts } from "../schema/accounts";
import { toAccountDomain, toAccountPersistence } from "../mappers/account-mapper";
import type { AccountRepository } from "@caixa-1/application";
import type { Account } from "@caixa-1/domain";

export class DrizzleAccountRepository implements AccountRepository {
  private readonly db: typeof defaultDb;

  constructor(dbInstance?: typeof defaultDb) {
    this.db = dbInstance ?? defaultDb;
  }

  async findById(accountId: string, userId: string): Promise<Account | null> {
    const [row] = await this.db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.id, accountId),
          eq(accounts.userId, userId),
          isNull(accounts.deletedAt),
        ),
      )
      .limit(1);

    return row ? toAccountDomain(row) : null;
  }

  async findByIdIncludingDeleted(
    accountId: string,
    userId: string,
  ): Promise<Account | null> {
    const [row] = await this.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
      .limit(1);

    return row ? toAccountDomain(row) : null;
  }

  async existsByName(userId: string, name: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, userId),
          sql`lower(trim(${accounts.name})) = lower(trim(${name}))`,
          isNull(accounts.deletedAt),
        ),
      )
      .limit(1);

    return row !== undefined;
  }

  async save(account: Account): Promise<void> {
    await this.db.insert(accounts).values(toAccountPersistence(account));
  }

  async findAllByUserId(userId: string): Promise<Account[]> {
    const rows = await this.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)));

    return rows.map(toAccountDomain);
  }

  async update(account: Account): Promise<void> {
    const persistence = toAccountPersistence(account);
    await this.db
      .update(accounts)
      .set({
        name: persistence.name,
        initialBalance: persistence.initialBalance,
        currency: persistence.currency,
        description: persistence.description,
        color: persistence.color,
        icon: persistence.icon,
        isActive: persistence.isActive,
        includeInTotal: persistence.includeInTotal,
        updatedAt: persistence.updatedAt,
        deletedAt: persistence.deletedAt,
      })
      .where(eq(accounts.id, persistence.id));
  }
}
