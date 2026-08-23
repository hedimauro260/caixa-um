import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import { archiveAccount, AccountNotFound } from "@caixa-1/domain";

export class ArchiveAccount {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    accountId: string,
  ): Promise<{ success: true }> {
    await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;

      const account = await accountRepo.findById(accountId, context.userId);
      if (!account) {
        throw new AccountNotFound(accountId);
      }

      const archived = archiveAccount(account);
      await accountRepo.update(archived);
    });

    return { success: true };
  }
}
