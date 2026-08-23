import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import { reactivateAccount, AccountNotFound } from "@caixa-1/domain";

export class ReactivateAccount {
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

      const reactivated = reactivateAccount(account);
      await accountRepo.update(reactivated);
    });

    return { success: true };
  }
}
