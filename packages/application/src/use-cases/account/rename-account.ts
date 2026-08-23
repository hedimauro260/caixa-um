import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { UpdateAccountInput, AccountOutput } from "../../dto/account-dto.js";
import { renameAccount, AccountNotFound } from "@caixa-1/domain";
import { AccountNameAlreadyExists } from "../../errors/application-errors.js";

export class RenameAccount {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    accountId: string,
    input: UpdateAccountInput,
  ): Promise<AccountOutput> {
    const updated = await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;

      const account = await accountRepo.findById(accountId, context.userId);
      if (!account) {
        throw new AccountNotFound(accountId);
      }

      if (input.name) {
        const exists = await accountRepo.existsByName(context.userId, input.name);
        if (exists) {
          throw new AccountNameAlreadyExists(input.name);
        }
      }

      let result = account;
      if (input.name) {
        result = renameAccount(result, input.name);
      }
      if (input.description !== undefined) {
        result = { ...result, description: input.description, updatedAt: new Date() };
      }
      if (input.color !== undefined) {
        result = { ...result, color: input.color, updatedAt: new Date() };
      }
      if (input.icon !== undefined) {
        result = { ...result, icon: input.icon, updatedAt: new Date() };
      }
      if (input.includeInTotal !== undefined) {
        result = { ...result, includeInTotal: input.includeInTotal, updatedAt: new Date() };
      }

      await accountRepo.update(result);
      return result;
    });

    return {
      id: updated.id,
      name: updated.name,
      type: updated.type,
      initialBalance: {
        amount: updated.initialBalance.amount,
        currency: updated.initialBalance.currency,
      },
      description: updated.description,
      color: updated.color,
      icon: updated.icon,
      isActive: updated.isActive,
      includeInTotal: updated.includeInTotal,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
