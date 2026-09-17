import { useState } from 'react'
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useUser,
} from '@clerk/clerk-react'
import {
  useAccounts,
  useCreateAccount,
  useCategories,
  useCreateCategory,
  useTransactions,
  useCreateTransaction,
  useTransactionSummary,
  useJournal,
  useExportJournal,
  formatCurrency,
  formatDate,
  formatSignedAmount,
  formatTransactionType,
  toDateInputValue,
} from '@caixa1/core'

function Dashboard() {
  const { user } = useUser()
  const [log, setLog] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
  }

  const accounts = useAccounts()
  const categories = useCategories()
  const transactions = useTransactions()
  const summary = useTransactionSummary()
  const journal = useJournal()

  const createAccount = useCreateAccount()
  const createCategory = useCreateCategory()
  const createTransaction = useCreateTransaction()

  const { export: exportJournal, isExporting } = useExportJournal()

  const handleCreateAccount = async (name: string, initialBalance = 0) => {
    try {
      const account = await createAccount.mutateAsync({
        name,
        type: 'checking',
        currency: 'BRL',
        initialBalance,
      })
      addLog(`✓ Conta criada: ${account.name} (${account.id.slice(0, 8)}...)`)
      return account
    } catch (err) {
      addLog(`✗ Erro ao criar conta: ${(err as Error).message}`)
      return null
    }
  }

  const handleCreateCategory = async (
    name: string,
    type: 'income' | 'expense'
  ) => {
    try {
      const category = await createCategory.mutateAsync({
        name,
        type,
        icon: type === 'income' ? '💰' : '🐶',
        color: type === 'income' ? '#00CC88' : '#FF8800',
      })
      addLog(`✓ Categoria criada: ${category.name}`)
      return category
    } catch (err) {
      addLog(`✗ Erro ao criar categoria: ${(err as Error).message}`)
      return null
    }
  }

  const handleCreateIncome = async () => {
    const account = accounts.data?.data[0]
    const category = categories.data?.data.find(
      (c) => c.type === 'income' && !c.isSystem
    )

    if (!account || !category) {
      addLog('✗ Crie uma conta e tenha categoria income primeiro')
      return
    }

    try {
      const tx = await createTransaction.mutateAsync({
        type: 'income',
        accountId: account.id,
        categoryId: category.id,
        amount: 500,
        date: toDateInputValue(),
        description: 'Teste income',
      })
      addLog(`✓ Income criado: ${formatCurrency(tx.amount)}`)
    } catch (err) {
      addLog(`✗ Erro: ${(err as Error).message}`)
    }
  }

  const handleCreateExpense = async () => {
    const account = accounts.data?.data[0]
    const category = categories.data?.data.find(
      (c) => c.type === 'expense' && !c.isSystem
    )

    if (!account || !category) {
      addLog('✗ Crie uma conta e tenha categoria expense primeiro')
      return
    }

    try {
      const tx = await createTransaction.mutateAsync({
        type: 'expense',
        accountId: account.id,
        categoryId: category.id,
        amount: 45,
        date: toDateInputValue(),
        description: 'Teste expense',
      })
      addLog(`✓ Expense criado: ${formatCurrency(tx.amount)}`)
    } catch (err) {
      addLog(`✗ Erro: ${(err as Error).message}`)
    }
  }

  const handleCreateTransfer = async () => {
    const accountsList = accounts.data?.data
    if (!accountsList || accountsList.length < 2) {
      addLog('✗ Crie pelo menos 2 contas primeiro')
      return
    }

    const fromAccount = accountsList[0]
    const toAccount = accountsList[1]

    try {
      const tx = await createTransaction.mutateAsync({
        type: 'transfer',
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 100,
        date: toDateInputValue(),
        description: 'Teste transfer',
      })
      addLog(
        `✓ Transfer criado: ${formatCurrency(tx.amount)} de ${fromAccount.name} → ${toAccount.name}`
      )
    } catch (err) {
      addLog(`✗ Erro: ${(err as Error).message}`)
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportJournal()
      addLog(
        `✓ Export: ${result.filename} (${result.headers.exportCount} linhas, ${result.size} bytes)`
      )
      if (result.headers.truncated) {
        addLog(`⚠ Export truncado (total: ${result.headers.totalCount})`)
      }
    } catch (err) {
      addLog(`✗ Erro no export: ${(err as Error).message}`)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 20 }}>CAIXA/1 — Workstation (Teste de Integração)</h1>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user?.primaryEmailAddress?.emailAddress}
          <UserButton />
        </span>
      </header>
      <p>Validação end-to-end dos hooks do @caixa1/core.</p>

      <section>
        <h2>Log</h2>
        <pre style={{ maxHeight: 200, overflow: 'auto' }}>
          {log.length === 0 ? '(vazio)' : log.join('\n')}
        </pre>
      </section>

      <hr />

      <section>
        <h2>1. Contas</h2>
        {accounts.isLoading && <p>Carregando...</p>}
        {accounts.error && (
          <p style={{ color: 'red' }}>Erro: {accounts.error.message}</p>
        )}
        {accounts.data && (
          <>
            <p>Total: {accounts.data.meta.total}</p>
            <ul>
              {accounts.data.data.map((acc) => (
                <li key={acc.id}>
                  {acc.name} — {formatCurrency(acc.balance)} ({acc.type})
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={() => handleCreateAccount(`Conta ${Date.now()}`, 1000)}
          disabled={createAccount.isPending}
        >
          {createAccount.isPending ? 'Criando...' : '+ Criar conta (R$ 1000)'}
        </button>
        <button
          onClick={() => handleCreateAccount(`Conta ${Date.now()}`, 0)}
          disabled={createAccount.isPending}
          style={{ marginLeft: 8 }}
        >
          + Criar conta (R$ 0)
        </button>
      </section>

      <hr />

      <section>
        <h2>2. Categorias</h2>
        {categories.isLoading && <p>Carregando...</p>}
        {categories.error && (
          <p style={{ color: 'red' }}>Erro: {categories.error.message}</p>
        )}
        {categories.data && (
          <>
            <p>Total: {categories.data.meta.total}</p>
            <ul>
              {categories.data.data.map((cat) => (
                <li key={cat.id}>
                  {cat.icon} {cat.name} ({cat.type})
                  {cat.isSystem && ' [sistema]'}
                </li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={() => handleCreateCategory(`Pets ${Date.now()}`, 'expense')}
          disabled={createCategory.isPending}
        >
          {createCategory.isPending ? 'Criando...' : '+ Criar categoria "Pets"'}
        </button>
      </section>

      <hr />

      <section>
        <h2>3. Transações</h2>
        <div>
          <button
            onClick={handleCreateIncome}
            disabled={createTransaction.isPending}
          >
            + Criar income R$ 500
          </button>
          <button
            onClick={handleCreateExpense}
            disabled={createTransaction.isPending}
            style={{ marginLeft: 8 }}
          >
            + Criar expense R$ 45
          </button>
          <button
            onClick={handleCreateTransfer}
            disabled={createTransaction.isPending}
            style={{ marginLeft: 8 }}
          >
            + Criar transfer R$ 100
          </button>
        </div>

        {transactions.isLoading && <p>Carregando...</p>}
        {transactions.error && (
          <p style={{ color: 'red' }}>Erro: {transactions.error.message}</p>
        )}
        {transactions.data && (
          <>
            <p>Total: {transactions.data.meta.total}</p>
            <ul>
              {transactions.data.data.map((tx) => (
                <li key={tx.id}>
                  {formatDate(tx.date)} — {tx.description ?? '(sem descrição)'}{' '}
                  — {formatTransactionType(tx.type)} —{' '}
                  <strong>{formatSignedAmount(tx.amount, tx.type)}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <hr />

      <section>
        <h2>4. Summary</h2>
        {summary.isLoading && <p>Carregando...</p>}
        {summary.error && (
          <p style={{ color: 'red' }}>Erro: {summary.error.message}</p>
        )}
        {summary.data && (
          <ul>
            <li>Receitas: {formatCurrency(summary.data.totalIncome)}</li>
            <li>Despesas: {formatCurrency(summary.data.totalExpense)}</li>
            <li>
              <strong>Saldo: {formatCurrency(summary.data.balance)}</strong>
            </li>
            <li>Transações: {summary.data.transactionCount}</li>
          </ul>
        )}
      </section>

      <hr />

      <section>
        <h2>5. Journal</h2>
        {journal.isLoading && <p>Carregando...</p>}
        {journal.error && (
          <p style={{ color: 'red' }}>Erro: {journal.error.message}</p>
        )}
        {journal.data && (
          <>
            <p>Total: {journal.data.meta.total}</p>
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: 4 }}>Data</th>
                  <th style={{ textAlign: 'left', padding: 4 }}>Conta</th>
                  <th style={{ textAlign: 'left', padding: 4 }}>Categoria</th>
                  <th style={{ textAlign: 'left', padding: 4 }}>Descrição</th>
                  <th style={{ textAlign: 'right', padding: 4 }}>Valor</th>
                  <th style={{ textAlign: 'right', padding: 4 }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {journal.data.data.map((entry) => (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: '1px solid #1a1a1a' }}
                  >
                    <td style={{ padding: 4 }}>{formatDate(entry.date)}</td>
                    <td style={{ padding: 4 }}>{entry.accountName}</td>
                    <td style={{ padding: 4 }}>
                      {entry.categoryName ?? '—'}
                    </td>
                    <td style={{ padding: 4 }}>
                      {entry.description ?? '—'}
                    </td>
                    <td
                      style={{
                        padding: 4,
                        textAlign: 'right',
                        color: entry.signedAmount.startsWith('-')
                          ? '#ff6666'
                          : '#66ff88',
                      }}
                    >
                      {formatCurrency(entry.signedAmount)}
                    </td>
                    <td style={{ padding: 4, textAlign: 'right' }}>
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <hr />

      <section>
        <h2>6. Export CSV</h2>
        <button onClick={handleExport} disabled={isExporting}>
          {isExporting ? 'Exportando...' : 'Exportar CSV'}
        </button>
      </section>
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