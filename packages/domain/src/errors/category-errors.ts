import { DomainError } from "./domain-error.js";

export class CategoryNameRequired extends DomainError {
  constructor() {
    super("CATEGORY_NAME_REQUIRED", "Nome da categoria é obrigatório");
  }
}

export class CategoryInvalidName extends DomainError {
  constructor(name: string) {
    super(
      "CATEGORY_INVALID_NAME",
      `Nome da categoria inválido: "${name}". Deve ter entre 1 e 50 caracteres.`,
    );
  }
}

export class CategorySelfParent extends DomainError {
  constructor() {
    super("CATEGORY_SELF_PARENT", "Categoria não pode ser pai de si mesma");
  }
}

export class CategoryCannotDeleteSelfParent extends DomainError {
  constructor() {
    super(
      "CATEGORY_CANNOT_DELETE_SELF_PARENT",
      "Categoria não pode ser excluída enquanto for pai de outras categorias",
    );
  }
}

export class CategoryCannotDeleteArchived extends DomainError {
  constructor() {
    super(
      "CATEGORY_CANNOT_DELETE_ARCHIVED",
      "Categoria arquivada não pode ser excluída",
    );
  }
}

export class CategoryCannotReactivateWithArchivedParent extends DomainError {
  constructor() {
    super(
      "CATEGORY_CANNOT_REACTIVATE_WITH_ARCHIVED_PARENT",
      "Categoria não pode ser reativada enquanto seu pai estiver arquivado",
    );
  }
}

export class CategoryCannotReactivateWithDeletedParent extends DomainError {
  constructor() {
    super(
      "CATEGORY_CANNOT_REACTIVATE_WITH_DELETED_PARENT",
      "Categoria não pode ser reativada enquanto seu pai estiver excluído",
    );
  }
}

export class CategoryCannotDeleteSoftDeleted extends DomainError {
  constructor() {
    super(
      "CATEGORY_CANNOT_DELETE_SOFT_DELETED",
      "Categoria já excluída não pode ser excluída novamente",
    );
  }
}

export class CategoryNotFound extends DomainError {
  constructor(id: string) {
    super("CATEGORY_NOT_FOUND", `Categoria não encontrada: ${id}`);
  }
}
