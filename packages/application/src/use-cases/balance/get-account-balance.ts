import type { ApplicationContext } from "../../context.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { BalanceOutput } from "../../dto/balance-dto.js";
import { calculateBalance, AccountNotFound } from "@caixa-1/domain";

export class GetAccountBalance {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(
    context: ApplicationContext,
    accountId: string,
  ): Promise<BalanceOutput> {
    const account = await this.accountRepository.findById(
      accountId,
      context.userId,
    );

    if (!account) {
      throw new AccountNotFound(accountId);
    }

    const entries = await this.transactionRepository.findByAccountUntilDate(
      accountId,
      context.userId,
      context.today,
    );

    const result = calculateBalance({
      initialBalance: account.initialBalance,
      accountType: account.type,
      entries,
    });

    return {
      finalBalance: {
        amount: result.finalBalance.amount,
        currency: result.finalBalance.currency,
      },
      valid: result.valid,
      firstViolation: result.firstViolation
        ? {
            accountId: result.firstViolation.accountId,
            balanceAtViolation: {
              amount: result.firstViolation.balanceAtViolation.amount,
              currency: result.firstViolation.balanceAtViolation.currency,
            },
          }
        : null,
    };
  }
}
