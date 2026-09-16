# Lab App Architecture

## Overview
The Lab app is a Vite-powered React single-page application (SPA) designed as an experimental UI host for `@caixa1` modules.

## Structure
- `src/main.tsx`: App root rendering the provider stack — ClerkProvider → QueryClientProvider → ApiProvider (mounts `ApiClientProvider` wrapping `createApiClient({ baseUrl, getToken })`) → BrowserRouter.
- `src/App.tsx`: Main UI component. Uses hooks from `@caixa1/core` (business hooks like `useAccounts`, `useCategories`, `useTransactions`, `useTransactionSummary`, `useJournal`, `useExportJournal`) and formatting utilities (`formatCurrency`, `formatDate`, `parseAmount`, etc.).

## Tech Stack
- **Bundler:** Vite
- **UI Framework:** React
- **Auth:** Clerk (`@clerk/clerk-react`)
- **State Management / Data Fetching:** TanStack React Query (`@tanstack/react-query`)
- **Data Layer:** `@caixa1/core` — `ApiClient` (get/getData/getList/post/patch/delete/download), `ApiError`/`NetworkError`, `ApiClientProvider`, queryKeys, endpoints, business hooks (23) and formatting/parsing utilities
- **Routing:** React Router (`react-router-dom`)
