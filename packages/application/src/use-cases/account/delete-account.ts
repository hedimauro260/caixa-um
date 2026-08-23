import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import { deleteAccount, AccountNotFound } from "@caixa-1/domain";

export class DeleteAccount {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    accountId: string,
  ): Promise<{ success: true }> {
    await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;

      const account = await accountRepo.findByIdIncludingDeleted(
        accountId,
        context.userId,
      );
      if (!account) {
        throw new AccountNotFound(accountId);
      }

      const deleted = deleteAccount(account);
      await accountRepo.update(deleted);
    });

    return { success: true };
  }
}
