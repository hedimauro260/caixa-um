import { DomainError } from "./domain-error.js";

export class AccountNameRequired extends DomainError {
  constructor() {
    super("ACCOUNT_NAME_REQUIRED", "Nome da conta é obrigatório");
  }
}

export class AccountInvalidName extends DomainError {
  constructor(name: string) {
    super(
      "ACCOUNT_INVALID_NAME",
      `Nome da conta inválido: "${name}". Deve ter entre 1 e 50 caracteres.`,
    );
  }
}

export class InvalidAccountType extends DomainError {
  constructor(type: string) {
    super("INVALID_ACCOUNT_TYPE", `Tipo de conta inválido: ${type}`);
  }
}

export class AccountInvalidInitialBalance extends DomainError {
  constructor(type: string, balance: string) {
    super(
      "ACCOUNT_INVALID_INITIAL_BALANCE",
      `Saldo inicial inválido para conta ${type}: ${balance}`,
    );
  }
}

export class AccountAlreadyArchived extends DomainError {
  constructor() {
    super("ACCOUNT_ALREADY_ARCHIVED", "Conta já está arquivada");
  }
}

export class AccountAlreadyActive extends DomainError {
  constructor() {
    super("ACCOUNT_ALREADY_ACTIVE", "Conta já está ativa");
  }
}

export class AccountCannotBeDeletedWithNonZeroBalance extends DomainError {
  constructor() {
    super(
      "ACCOUNT_CANNOT_BE_DELETED_WITH_NON_ZERO_BALANCE",
      "Conta não pode ser excluída com saldo diferente de zero",
    );
  }
}

export class AccountCannotBeDeletedWithFutureTransactions extends DomainError {
  constructor() {
    super(
      "ACCOUNT_CANNOT_BE_DELETED_WITH_FUTURE_TRANSACTIONS",
      "Conta não pode ser excluída com transações futuras",
    );
  }
}

export class AccountCannotBeReactivated extends DomainError {
  constructor(reason: string) {
    super("ACCOUNT_CANNOT_BE_REACTIVATED", `Conta não pode ser reativada: ${reason}`);
  }
}

export class AccountCannotBeDeletedSoftDeleted extends DomainError {
  constructor() {
    super(
      "ACCOUNT_CANNOT_BE_DELETED_SOFT_DELETED",
      "Conta já excluída não pode ser excluída novamente",
    );
  }
}

export class AccountNotFound extends DomainError {
  constructor(id: string) {
    super("ACCOUNT_NOT_FOUND", `Conta não encontrada: ${id}`);
  }
}
