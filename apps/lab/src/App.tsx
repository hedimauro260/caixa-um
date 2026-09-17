import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useUser,
} from '@clerk/clerk-react'
import {
  useAccounts,
  useCategories,
  useCreateAccount,
  useTransactions,
  useTransactionSummary,
  useCreateTransaction,
  useJournal,
  useExportJournal,
  formatCurrency,
  formatSignedAmount,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatRelativeTime,
  parseAmount,
  parseDate,
} from '@caixa1/core'

function Dashboard() {
  const { user } = useUser()
  const accounts = useAccounts()
  const categories = useCategories()
  const createAccount = useCreateAccount()
  const transactions = useTransactions()
  const summary = useTransactionSummary()
  const createTransaction = useCreateTransaction()
  const journal = useJournal()
  const {
    export: exportJournal,
    isExporting,
    error: exportError,
  } = useExportJournal()

  const handleExport = async () => {
    try {
      const result = await exportJournal()
      console.log('Exportado:', result)
    } catch (err) {
      console.error('Erro no export:', err)
    }
  }

  const handleCreateAccount = () => {
    createAccount.mutate({
      name: `Conta Teste ${Date.now()}`,
      type: 'checking',
      currency: 'BRL',
      initialBalance: 0,
    })
  }

  const handleCreateIncome = () => {
    const account = accounts.data?.data[0]
    const category = categories.data?.data.find(
      (c) => c.type === 'income' && !c.isSystem
    )

    if (!account || !category) {
      alert('Crie uma conta e tenha uma categoria income primeiro')
      return
    }

    createTransaction.mutate({
      type: 'income',
      accountId: account.id,
      categoryId: category.id,
      amount: 100,
      date: new Date().toISOString().slice(0, 10),
      description: 'Transação de teste',
    })
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: 40 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1>CAIXA/1 — Lab</h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.primaryEmailAddress?.emailAddress}
          <UserButton />
        </span>
      </header>
      <p>Seu dinheiro, em registro.</p>

      <hr />

      <h2>Accounts</h2>
      {accounts.isLoading && <p>Carregando contas...</p>}
      {accounts.error && (
        <p style={{ color: 'red' }}>Erro: {accounts.error.message}</p>
      )}
      {accounts.data && (
        <>
          <p>Total: {accounts.data.meta.total}</p>
          <pre>{JSON.stringify(accounts.data.data, null, 2)}</pre>
        </>
      )}

      <hr />

      <h2>Categories</h2>
      {categories.isLoading && <p>Carregando categorias...</p>}
      {categories.error && (
        <p style={{ color: 'red' }}>Erro: {categories.error.message}</p>
      )}
      {categories.data && (
        <>
          <p>Total: {categories.data.meta.total}</p>
          <pre>{JSON.stringify(categories.data.data, null, 2)}</pre>
        </>
      )}

      <hr />

      <h2>Summary</h2>
      {summary.isLoading && <p>Carregando summary...</p>}
      {summary.error && (
        <p style={{ color: 'red' }}>Erro: {summary.error.message}</p>
      )}
      {summary.data && <pre>{JSON.stringify(summary.data, null, 2)}</pre>}

      <hr />

      <h2>Transactions</h2>
      {transactions.isLoading && <p>Carregando transações...</p>}
      {transactions.error && (
        <p style={{ color: 'red' }}>Erro: {transactions.error.message}</p>
      )}
      {transactions.data && (
        <>
          <p>Total: {transactions.data.meta.total}</p>
          <pre>{JSON.stringify(transactions.data.data, null, 2)}</pre>
        </>
      )}

      <hr />

      <button onClick={handleCreateAccount} disabled={createAccount.isPending}>
        {createAccount.isPending ? 'Criando...' : 'Criar conta de teste'}
      </button>
      {createAccount.error && (
        <p style={{ color: 'red' }}>Erro: {createAccount.error.message}</p>
      )}

      <br />
      <br />

      <button
        onClick={handleCreateIncome}
        disabled={createTransaction.isPending}
      >
        {createTransaction.isPending
          ? 'Criando...'
          : 'Criar income de R$ 100'}
      </button>
      {createTransaction.error && (
        <p style={{ color: 'red' }}>Erro: {createTransaction.error.message}</p>
      )}

      <hr />

      <h2>Journal</h2>
      {journal.isLoading && <p>Carregando journal...</p>}
      {journal.error && (
        <p style={{ color: 'red' }}>Erro: {journal.error.message}</p>
      )}
      {journal.data && (
        <>
          <p>Total: {journal.data.meta.total}</p>
          <pre>{JSON.stringify(journal.data.data, null, 2)}</pre>
        </>
      )}

      <hr />

      <h2>Export</h2>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exportando...' : 'Exportar CSV'}
      </button>
      {exportError && (
        <p style={{ color: 'red' }}>Erro: {exportError.message}</p>
      )}

      <hr />

      <h2>Format Utilities</h2>

      <h3>Currency</h3>
      <ul>
        <li>formatCurrency('1234.56') = {formatCurrency('1234.56')}</li>
        <li>formatCurrency('1234.56', 'USD') = {formatCurrency('1234.56', 'USD')}</li>
        <li>formatCurrency(0) = {formatCurrency(0)}</li>
        <li>formatCurrency('invalid') = {formatCurrency('invalid')}</li>
      </ul>

      <h3>Signed Amount</h3>
      <ul>
        <li>income 500 = {formatSignedAmount(500, 'income')}</li>
        <li>expense 500 = {formatSignedAmount(500, 'expense')}</li>
        <li>transfer 500 = {formatSignedAmount(500, 'transfer')}</li>
      </ul>

      <h3>Dates</h3>
      <ul>
        <li>formatDate('2025-01-15') = {formatDate('2025-01-15')}</li>
        <li>formatDateLong('2025-01-15') = {formatDateLong('2025-01-15')}</li>
        <li>
          formatDateTime('2025-01-15T14:30:00Z') ={' '}
          {formatDateTime('2025-01-15T14:30:00Z')}
        </li>
        <li>
          formatRelativeTime(agora) ={' '}
          {formatRelativeTime(new Date().toISOString())}
        </li>
      </ul>

      <h3>Parse</h3>
      <ul>
        <li>parseAmount('1.234,56') = {String(parseAmount('1.234,56'))}</li>
        <li>parseAmount('1234.56') = {String(parseAmount('1234.56'))}</li>
        <li>parseAmount('R$ 1.234,56') = {String(parseAmount('R$ 1.234,56'))}</li>
        <li>parseAmount('abc') = {String(parseAmount('abc'))}</li>
        <li>parseDate('15/01/2025') = {String(parseDate('15/01/2025'))}</li>
        <li>parseDate('2025-02-30') = {String(parseDate('2025-02-30'))}</li>
      </ul>
    </div>
  )
}

export function App() {
  return (
    <>
      <SignedOut>
        <div
          style={{
            fontFamily: 'monospace',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <h1>CAIXA/1</h1>
          <p>Entre com sua conta para continuar.</p>
          <div style={{ marginTop: 24 }}>
            <SignIn />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}