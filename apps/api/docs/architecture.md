# API Architecture

## Overview
The API is built using [Hono](https://hono.dev) and designed to run on Cloudflare Workers / Node runtime environments.

## Structure
- `src/index.ts`: Application entry point and global middleware (CORS, Logger).
- `src/routes/`: Route handlers.
  - `health.ts`: Healthcheck endpoint (`GET /health`).
- `src/bindings.ts`: Environment variable and binding types.

## Tech Stack
- **Framework:** Hono
- **Runtime:** Cloudflare Workers (via Wrangler) / Node.js
- **Database:** Neon PostgreSQL (via `@caixa1/db`)
