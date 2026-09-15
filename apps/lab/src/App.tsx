import { useApi } from './hooks/useApi'
import { usePing } from '@caixa1/core'

export function App() {
  const api = useApi()
  const { data, isLoading, error } = usePing(api)

  return (
    <div style={{ fontFamily: 'monospace', padding: 40 }}>
      <h1>CAIXA/1 — Lab</h1>
      <p>Seu dinheiro, em registro.</p>

      <hr />

      <h2>Teste de integração</h2>
      {isLoading && <p>Consultando API...</p>}
      {error && <p style={{ color: 'red' }}>Erro: {error.message}</p>}
      {data && (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  )
}
