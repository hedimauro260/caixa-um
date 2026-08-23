import { DomainError } from "./domain-error.js";

export class UserNotFound extends DomainError {
  constructor(identifier: string) {
    super("USER_NOT_FOUND", `Usuário não encontrado: ${identifier}`);
  }
}

export class UserNameRequired extends DomainError {
  constructor() {
    super("USER_NAME_REQUIRED", "Nome do usuário é obrigatório");
  }
}

export class UserInvalidName extends DomainError {
  constructor(name: string) {
    super(
      "USER_INVALID_NAME",
      `Nome do usuário inválido: "${name}". Deve ter entre 1 e 100 caracteres.`,
    );
  }
}

export class UserAlreadyExists extends DomainError {
  constructor(clerkId: string) {
    super("USER_ALREADY_EXISTS", `Usuário já existe para o Clerk ID: ${clerkId}`);
  }
}
