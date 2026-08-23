import type { Account } from "@caixa-1/domain";

export interface AccountRepository {
  findById(accountId: string, userId: string): Promise<Account | null>;
  findByIdIncludingDeleted(
    accountId: string,
    userId: string,
  ): Promise<Account | null>;
  existsByName(userId: string, name: string): Promise<boolean>;
  findAllByUserId(userId: string): Promise<Account[]>;
  save(account: Account): Promise<void>;
  update(account: Account): Promise<void>;
}
