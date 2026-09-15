# Lab App Architecture

## Overview
The Lab app is a Vite-powered React single-page application (SPA) designed as an experimental UI host for `@caixa1` modules.

## Structure
- `src/main.tsx`: App root rendering ClerkProvider, QueryClientProvider, and BrowserRouter.
- `src/App.tsx`: Main UI component.
- `src/hooks/`: Local custom hooks.

## Tech Stack
- **Bundler:** Vite
- **UI Framework:** React
- **Auth:** Clerk (`@clerk/clerk-react`)
- **State Management / Data Fetching:** TanStack React Query (`@tanstack/react-query`) via `@caixa1/core`
- **Routing:** React Router (`react-router-dom`)
