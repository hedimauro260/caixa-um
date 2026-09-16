# Lab App Development Log

## Phase 0 - Monorepo Setup
- Initialized React application with Vite.
- Wrapped root with ClerkProvider and TanStack QueryClientProvider.
- Connected `@caixa1/core` and `@caixa1/ui-contracts`.

## Phase 2 - Data Layer, Hooks and Utils

### Part 1 - Client HTTP + queryClient + Hook Structure
- `src/main.tsx`: new `ApiProvider` mounts `ApiClientProvider` with `createApiClient({ baseUrl, getToken })` from Clerk; provider order: Clerk → QueryClient → Api → BrowserRouter.
- `src/App.tsx`: replaced `usePing` with `useQuery` directly via `api.get('/health')`; removed the local hook `src/hooks/useApi.ts` (the entire `hooks/` folder was deleted).
- `packages/core`: `queryClient.ts` became a factory (`createQueryClient()`) + singleton with `refetchOnMount: false`.
- `packages/core`: full HTTP client in `api/client.ts` — `get`, `getData`, `getList`, `post`, `patch`, `delete`; `buildUrl` via `URL`; skips `undefined/null` query params; handles `AbortError`, `204` and JSON parsing.
- `packages/core`: `api/errors.ts` — `ApiError` with `code`/`status`/`details` + helpers (`isUnauthorized`, `isValidation`, `isNotFound`, `isConflict`); `NetworkError` with status 0.
- `packages/core`: `api/context.tsx` — `ApiClientProvider` + `useApiClient()` (throws outside provider).
- `packages/core`: `queryKeys.ts` (hierarchical keys for accounts/categories/transactions/journal/health) and `hooks/useApi.ts` (alias for `useApiClient`).
- Removed legacy `usePing` from Phase 0.

### Part 2 - Accounts + Categories Hooks
- `packages/core`: `api/endpoints.ts` centralizes API paths (accounts, categories, transactions, journal).
- `packages/core`: `hooks/useAccounts.ts` (7 hooks) and `hooks/useCategories.ts` (7 hooks) following the query/mutation pattern.
- Invalidation: account mutations also invalidate transactions + journal (initial balance creates a transaction); category mutations only invalidate their own domain.

### Part 3.1 - Transactions Hooks
- `packages/core`: `hooks/useTransactions.ts` (8 hooks) with `useCreateTransaction` accepting the discriminated union (`income | expense | transfer`).
- Cascade invalidation: create/update/delete invalidate transactions + accounts (balance via trigger) + journal (view); archive/unarchive do not invalidate accounts (trigger doesn't react to `is_archived`).

### Part 3.2 - Journal Hooks + CSV Export
- `packages/core`: `api/export.ts` — `downloadFile()` helper (Blob + `createObjectURL` + `a.click()`); parses `Content-Disposition` filename; reads `X-Total-Count`/`X-Export-Count`/`X-Truncated` headers.
- `packages/core`: `api/client.ts` gained the `download` method, which injects the auth token and delegates to `downloadFile`.
- `packages/core`: `hooks/useJournal.ts` — `useJournal`, `useJournalEntry` (read-only queries) and `useExportJournal` (imperative function with local state `isExporting`/`error`, no React Query).
- `src/App.tsx`: "Exportar CSV" button for end-to-end download validation.

### Part 3.3 - Formatting Utilities
- `packages/core`: `utils/format.ts` (14 functions) — currency via `Intl.NumberFormat` pt-BR, semantic signed amounts, dates (using `new Date(y,m,d)` local construction to avoid timezone off-by-one), labels and colors.
- `packages/core`: `utils/parse.ts` (5 functions) — `parseAmount` with decimal separator heuristic (accepts `1.234,56`, `1234.56`, `R$ 1.234,56`), `parseDate` validates real dates (`2025-02-30` → null), `parseColor`, `truncate`.
- `packages/core`: `utils/constants.ts` (7 constants) — labels/symbols/colors centralized.
- `src/App.tsx`: "Format Utilities" section for visual validation.
