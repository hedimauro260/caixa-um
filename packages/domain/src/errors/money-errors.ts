import { DomainError } from "./domain-error.js";

export class InvalidMoneyAmount extends DomainError {
  constructor(amount: string) {
    super("INVALID_MONEY_AMOUNT", `Valor monetário inválido: ${amount}`);
  }
}

export class MoneyPrecisionExceeded extends DomainError {
  constructor(amount: string) {
    super(
      "MONEY_PRECISION_EXCEEDED",
      `Precisão monetária excedida: ${amount}. Máximo 2 casas decimais.`,
    );
  }
}

export class IncompatibleCurrencyOperation extends DomainError {
  constructor(currencyA: string, currencyB: string) {
    super(
      "INCOMPATIBLE_CURRENCY_OPERATION",
      `Operação entre moedas incompatíveis: ${currencyA} e ${currencyB}`,
    );
  }
}
