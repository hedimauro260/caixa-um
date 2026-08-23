import type { ApplicationContext } from "../../context.js";
import type { UnitOfWork } from "../../unit-of-work.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { CreateAccountInput, AccountOutput } from "../../dto/account-dto.js";
import { createAccount } from "@caixa-1/domain";
import { AccountNameAlreadyExists } from "../../errors/application-errors.js";
import { createAccountId } from "@caixa-1/domain";

export class CreateAccount {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(
    context: ApplicationContext,
    input: CreateAccountInput,
  ): Promise<AccountOutput> {
    const created = await this.unitOfWork.execute(async (repos) => {
      const accountRepo = repos.accountRepository as AccountRepository;

      const exists = await accountRepo.existsByName(context.userId, input.name);
      if (exists) {
        throw new AccountNameAlreadyExists(input.name);
      }

      const account = createAccount({
        id: createAccountId(crypto.randomUUID()),
        userId: context.userId,
        name: input.name,
        type: input.type,
        initialBalance: input.initialBalance,
        currency: input.currency,
        description: input.description,
        color: input.color,
        icon: input.icon,
        includeInTotal: input.includeInTotal,
      });

      await accountRepo.save(account);
      return account;
    });

    return {
      id: created.id,
      name: created.name,
      type: created.type,
      initialBalance: {
        amount: created.initialBalance.amount,
        currency: created.initialBalance.currency,
      },
      description: created.description,
      color: created.color,
      icon: created.icon,
      isActive: created.isActive,
      includeInTotal: created.includeInTotal,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
