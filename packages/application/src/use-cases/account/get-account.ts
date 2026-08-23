import type { ApplicationContext } from "../../context.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { AccountOutput } from "../../dto/account-dto.js";
import { AccountNotFound } from "@caixa-1/domain";

export class GetAccount {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(
    context: ApplicationContext,
    accountId: string,
  ): Promise<AccountOutput> {
    const account = await this.accountRepository.findById(
      accountId,
      context.userId,
    );

    if (!account) {
      throw new AccountNotFound(accountId);
    }

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      initialBalance: {
        amount: account.initialBalance.amount,
        currency: account.initialBalance.currency,
      },
      description: account.description,
      color: account.color,
      icon: account.icon,
      isActive: account.isActive,
      includeInTotal: account.includeInTotal,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    };
  }
}
