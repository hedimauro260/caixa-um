import { StrictMode, useMemo } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import {
  queryClient,
  ApiClientProvider,
  createApiClient,
} from '@caixa1/core'
import { App } from './App'
import './index.css'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY ausente no .env')
}

function ApiProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()

  const api = useMemo(
    () =>
      createApiClient({
        baseUrl: import.meta.env.VITE_API_URL,
        getToken: () => getToken(),
      }),
    [getToken]
  )

  return <ApiClientProvider client={api}>{children}</ApiClientProvider>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_KEY}>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ApiProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>
)