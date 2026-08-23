export class ApplicationError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OperationNotAllowed extends ApplicationError {
  constructor(message: string) {
    super(message, "OPERATION_NOT_ALLOWED");
  }
}

export class AccountNameAlreadyExists extends ApplicationError {
  constructor(name: string) {
    super(`Account name already exists: ${name}`, "ACCOUNT_NAME_ALREADY_EXISTS");
  }
}

export class CategoryNameAlreadyExists extends ApplicationError {
  constructor(name: string) {
    super(`Category name already exists: ${name}`, "CATEGORY_NAME_ALREADY_EXISTS");
  }
}
