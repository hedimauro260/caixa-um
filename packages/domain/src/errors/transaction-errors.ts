import { DomainError } from "./domain-error.js";

export class TransactionDescriptionRequired extends DomainError {
  constructor() {
    super("TRANSACTION_DESCRIPTION_REQUIRED", "Descrição da transação é obrigatória");
  }
}

export class TransactionInvalidDescription extends DomainError {
  constructor(description: string) {
    super(
      "TRANSACTION_INVALID_DESCRIPTION",
      `Descrição inválida: "${description}". Deve ter entre 3 e 200 caracteres.`,
    );
  }
}

export class TransactionDateRequired extends DomainError {
  constructor() {
    super("TRANSACTION_DATE_REQUIRED", "Data da transação é obrigatória");
  }
}

export class InvalidTransactionType extends DomainError {
  constructor(type: string) {
    super("INVALID_TRANSACTION_TYPE", `Tipo de transação inválido: ${type}`);
  }
}

export class TransactionLinesCannotBeEmpty extends DomainError {
  constructor() {
    super("TRANSACTION_LINES_CANNOT_BE_EMPTY", "Transação deve ter pelo menos uma line");
  }
}

export class TransactionInvalidLineCount extends DomainError {
  constructor(type: string, expected: number, actual: number) {
    super(
      "TRANSACTION_INVALID_LINE_COUNT",
      `Transação ${type} deve ter ${expected} line(s), encontrou ${actual}`,
    );
  }
}

export class TransactionLineMustBeCredit extends DomainError {
  constructor() {
    super(
      "TRANSACTION_LINE_MUST_BE_CREDIT",
      "Line de INCOME deve ser CREDIT",
    );
  }
}

export class TransactionLineMustBeDebit extends DomainError {
  constructor() {
    super(
      "TRANSACTION_LINE_MUST_BE_DEBIT",
      "Line de EXPENSE deve ser DEBIT",
    );
  }
}

export class SameAccountTransferError extends DomainError {
  constructor() {
    super(
      "SAME_ACCOUNT_TRANSFER",
      "Transferência não pode ter origem e destino na mesma conta",
    );
  }
}

export class TransferAmountsMustBeEqual extends DomainError {
  constructor() {
    super(
      "TRANSFER_AMOUNTS_MUST_BE_EQUAL",
      "Valores de débito e crédito devem ser iguais em uma transferência",
    );
  }
}

export class TransactionCategoryCannotBeUsedWithTransfer extends DomainError {
  constructor() {
    super(
      "TRANSACTION_CATEGORY_CANNOT_BE_USED_WITH_TRANSFER",
      "Transferência não pode ter categoria",
    );
  }
}

export class TransactionCannotBeDeleted extends DomainError {
  constructor() {
    super("TRANSACTION_CANNOT_BE_DELETED", "Transação não pode ser excluída");
  }
}

export class TransactionAlreadyDeleted extends DomainError {
  constructor() {
    super("TRANSACTION_ALREADY_DELETED", "Transação já está excluída");
  }
}

export class TransactionCannotDeleteFutureOnCASH extends DomainError {
  constructor() {
    super(
      "TRANSACTION_CANNOT_DELETE_FUTURE_ON_CASH",
      "Transação futura em conta CASH não pode ser excluída",
    );
  }
}

export class TransactionCannotChangeType extends DomainError {
  constructor() {
    super(
      "TRANSACTION_CANNOT_CHANGE_TYPE",
      "Tipo de transação não pode ser alterado",
    );
  }
}

export class TransactionNotFound extends DomainError {
  constructor(id: string) {
    super("TRANSACTION_NOT_FOUND", `Transação não encontrada: ${id}`);
  }
}
