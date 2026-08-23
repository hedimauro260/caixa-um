import {
  DrizzleAccountRepository,
  DrizzleCategoryRepository,
  DrizzleTransactionRepository,
  DrizzleUnitOfWork,
} from "@caixa-1/database";
import {
  CreateAccount,
  RenameAccount,
  ArchiveAccount,
  ReactivateAccount,
  DeleteAccount,
  GetAccount,
  CreateCategory,
  UpdateCategory,
  ArchiveCategory,
  ReactivateCategory,
  DeleteCategory,
  GetCategory,
  ListCategories,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
  GetTransaction,
  GetAccountBalance,
  GetHistoricalBalance,
  GetTotalBalance,
  GetJournal,
} from "@caixa-1/application";

const accountRepo = new DrizzleAccountRepository();
const categoryRepo = new DrizzleCategoryRepository();
const transactionRepo = new DrizzleTransactionRepository();
const unitOfWork = new DrizzleUnitOfWork();

export const container = {
  repos: {
    account: accountRepo,
    category: categoryRepo,
    transaction: transactionRepo,
  },
  unitOfWork,
  useCases: {
    createAccount: new CreateAccount(unitOfWork),
    renameAccount: new RenameAccount(unitOfWork),
    archiveAccount: new ArchiveAccount(unitOfWork),
    reactivateAccount: new ReactivateAccount(unitOfWork),
    deleteAccount: new DeleteAccount(unitOfWork),
    getAccount: new GetAccount(accountRepo),

    createCategory: new CreateCategory(unitOfWork),
    updateCategory: new UpdateCategory(unitOfWork),
    archiveCategory: new ArchiveCategory(unitOfWork),
    reactivateCategory: new ReactivateCategory(unitOfWork),
    deleteCategory: new DeleteCategory(unitOfWork),
    getCategory: new GetCategory(categoryRepo),
    listCategories: new ListCategories(categoryRepo),

    createTransaction: new CreateTransaction(unitOfWork),
    updateTransaction: new UpdateTransaction(unitOfWork),
    deleteTransaction: new DeleteTransaction(unitOfWork),
    getTransaction: new GetTransaction(transactionRepo),

    getAccountBalance: new GetAccountBalance(accountRepo, transactionRepo),
    getHistoricalBalance: new GetHistoricalBalance(accountRepo, transactionRepo),
    getTotalBalance: new GetTotalBalance(accountRepo, transactionRepo),

    getJournal: new GetJournal(transactionRepo),
  },
};
