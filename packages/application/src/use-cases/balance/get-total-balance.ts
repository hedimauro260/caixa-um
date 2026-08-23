import type { ApplicationContext } from "../../context.js";
import type { AccountRepository } from "../../repositories/account-repository.js";
import type { TransactionRepository } from "../../repositories/transaction-repository.js";
import type { BalanceOutput } from "../../dto/balance-dto.js";
import { calculateBalance, createMoney, add } from "@caixa-1/domain";

export class GetTotalBalance {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(context: ApplicationContext): Promise<BalanceOutput> {
    const accounts = await this.accountRepository.findAllByUserId(
      context.userId,
    );

    const activeAccounts = accounts.filter(
      (a) => a.isActive && a.includeInTotal,
    );

    if (activeAccounts.length === 0) {
      return {
        finalBalance: { amount: "0", currency: "AOA" },
        valid: true,
        firstViolation: null,
      };
    }

    const accountIds = activeAccounts.map((a) => a.id);
    const allEntries = await this.transactionRepository.findByAccountIds(
      accountIds,
      context.userId,
      context.today,
    );

    let totalBalance = createMoney("0", "AOA");
    let firstViolation: BalanceOutput["firstViolation"] = null;

    for (const account of activeAccounts) {
      const accountEntries = allEntries.filter(
        (e) => e.accountId === account.id,
      );

      const result = calculateBalance({
        initialBalance: account.initialBalance,
        accountType: account.type,
        entries: accountEntries,
      });

      totalBalance = add(totalBalance, result.finalBalance);

      if (!firstViolation && result.firstViolation) {
        firstViolation = {
          accountId: result.firstViolation.accountId,
          balanceAtViolation: {
            amount: result.firstViolation.balanceAtViolation.amount,
            currency: result.firstViolation.balanceAtViolation.currency,
          },
        };
      }
    }

    return {
      finalBalance: {
        amount: totalBalance.amount,
        currency: totalBalance.currency,
      },
      valid: firstViolation === null,
      firstViolation,
    };
  }
}
