import type { FastifyInstance, FastifyError } from "fastify";
import { DomainError } from "@caixa-1/domain";
import { ApplicationError } from "@caixa-1/application";

const DOMAIN_ERROR_STATUS_MAP: Record<string, number> = {
  ACCOUNT_NOT_FOUND: 404,
  CATEGORY_NOT_FOUND: 404,
  TRANSACTION_NOT_FOUND: 404,
  ACCOUNT_NAME_REQUIRED: 422,
  ACCOUNT_INVALID_NAME: 422,
  ACCOUNT_INVALID_INITIAL_BALANCE: 422,
  ACCOUNT_ALREADY_ARCHIVED: 409,
  ACCOUNT_ALREADY_ACTIVE: 409,
  ACCOUNT_CANNOT_BE_DELETED_WITH_NON_ZERO_BALANCE: 422,
  ACCOUNT_CANNOT_BE_DELETED_WITH_FUTURE_TRANSACTIONS: 422,
  ACCOUNT_CANNOT_BE_REACTIVATED: 422,
  ACCOUNT_CANNOT_BE_DELETED_SOFT_DELETED: 409,
  CATEGORY_NAME_REQUIRED: 422,
  CATEGORY_INVALID_NAME: 422,
  CATEGORY_SELF_PARENT: 422,
  CATEGORY_CANNOT_DELETE_SELF_PARENT: 422,
  CATEGORY_CANNOT_DELETE_ARCHIVED: 409,
  CATEGORY_CANNOT_REACTIVATE_WITH_ARCHIVED_PARENT: 422,
  CATEGORY_CANNOT_REACTIVATE_WITH_DELETED_PARENT: 422,
  CATEGORY_CANNOT_DELETE_SOFT_DELETED: 409,
  TRANSACTION_DESCRIPTION_REQUIRED: 422,
  TRANSACTION_INVALID_DESCRIPTION: 422,
  TRANSACTION_DATE_REQUIRED: 422,
  TRANSACTION_LINES_CANNOT_BE_EMPTY: 422,
  TRANSACTION_INVALID_LINE_COUNT: 422,
  TRANSACTION_LINE_MUST_BE_CREDIT: 422,
  TRANSACTION_LINE_MUST_BE_DEBIT: 422,
  SAME_ACCOUNT_TRANSFER: 422,
  TRANSFER_AMOUNTS_MUST_BE_EQUAL: 422,
  TRANSACTION_CATEGORY_CANNOT_BE_USED_WITH_TRANSFER: 422,
  TRANSACTION_CANNOT_BE_DELETED: 409,
  TRANSACTION_ALREADY_DELETED: 409,
  TRANSACTION_CANNOT_DELETE_FUTURE_ON_CASH: 422,
  TRANSACTION_CANNOT_CHANGE_TYPE: 409,
  INVALID_MONEY_AMOUNT: 422,
  MONEY_PRECISION_EXCEEDED: 422,
  INCOMPATIBLE_CURRENCY_OPERATION: 422,
  INVALID_ACCOUNT_TYPE: 422,
  INVALID_TRANSACTION_TYPE: 422,
};

const APPLICATION_ERROR_STATUS_MAP: Record<string, number> = {
  ACCOUNT_NAME_ALREADY_EXISTS: 409,
  CATEGORY_NAME_ALREADY_EXISTS: 409,
  OPERATION_NOT_ALLOWED: 403,
};

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function setupErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | DomainError | ApplicationError | Error, _request, reply) => {
      if (error instanceof DomainError) {
        const status = DOMAIN_ERROR_STATUS_MAP[error.code] ?? 422;
        const body: ErrorResponse = {
          error: {
            code: error.code,
            message: error.message,
          },
        };
        return reply.status(status).send(body);
      }

      if (error instanceof ApplicationError) {
        const status = APPLICATION_ERROR_STATUS_MAP[error.code] ?? 400;
        const body: ErrorResponse = {
          error: {
            code: error.code,
            message: error.message,
          },
        };
        return reply.status(status).send(body);
      }

      if ("statusCode" in error && typeof error.statusCode === "number") {
        const body: ErrorResponse = {
          error: {
            code: error.code ?? "FASTIFY_ERROR",
            message: error.message,
          },
        };
        return reply.status(error.statusCode).send(body);
      }

      app.log.error(error);
      const body: ErrorResponse = {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro interno do servidor",
        },
      };
      return reply.status(500).send(body);
    },
  );
}
