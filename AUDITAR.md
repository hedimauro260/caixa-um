# AUDITORIA — caixa-um

Arquivos do tree de referência que **existem no projeto**, com o conteúdo atual.

**Não presentes no projeto (ignorados):** `apps/minimal/package.json`, `packages/ui-workstation/package.json`, `packages/ui-minimal/package.json`, `packages/ui-terminal/package.json`.

---

## RAIZ

### `package.json`

```json
{
  "name": "caixa/1",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "pnpm --filter @caixa1/api dev",
    "dev:lab": "pnpm --filter @caixa1/lab dev",
    "dev:workstation": "pnpm --filter @caixa1/workstation dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.7.0"
  }
}
```

### `turbo.json`

```json
{"$schema": "https://turbo.build/schema.json", "globalDependencies": [".env"], "globalEnv": ["NODE_ENV"], "tasks": {"build": {"dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"]}, "dev": {"cache": false, "persistent": true}, "lint": {"dependsOn": ["^build"], "outputs": []}, "typecheck": {"dependsOn": ["^build"], "outputs": []}, "clean": {"cache": false}}}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## APPS

### `apps/api/package.json`

```json
{
  "name": "@caixa1/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev --port 8787",
    "deploy": "wrangler deploy",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "clean": "rm -rf .turbo node_modules .wrangler"
  },
  "dependencies": {
    "@caixa1/db": "workspace:*",
    "@caixa1/shared": "workspace:*",
    "@clerk/backend": "^1.21.0",
    "drizzle-orm": "^0.38.0",
    "hono": "^4.6.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@caixa1/config": "workspace:*",
    "@cloudflare/workers-types": "^4.20241218.0",
    "@types/node": "^22.10.0",
    "eslint": "^9.17.0",
    "typescript": "^5.7.0",
    "wrangler": "^3.99.0"
  }
}
```

### `apps/workstation/package.json`

```json
{
  "name": "@caixa1/workstation",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 4174",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "clean": "rm -rf .turbo node_modules dist"
  },
  "dependencies": {
    "@caixa1/core": "workspace:*",
    "@caixa1/shared": "workspace:*",
    "@caixa1/ui-contracts": "workspace:*",
    "@clerk/clerk-react": "^5.20.0",
    "@tanstack/react-query": "^5.62.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0"
  },
  "devDependencies": {
    "@caixa1/config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.17.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

### `apps/lab/package.json`

```json
{
  "name": "@caixa1/lab",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "clean": "rm -rf .turbo node_modules dist"
  },
  "dependencies": {
    "@caixa1/core": "workspace:*",
    "@caixa1/shared": "workspace:*",
    "@caixa1/ui-contracts": "workspace:*",
    "@clerk/clerk-react": "^5.20.0",
    "@tanstack/react-query": "^5.62.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0"
  },
  "devDependencies": {
    "@caixa1/config": "workspace:*",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "eslint": "^9.17.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

---

## PACKAGES

### `packages/db/package.json`

```json
{
  "name": "@caixa1/db",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "clean": "rm -rf .turbo node_modules",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.0",
    "drizzle-orm": "^0.38.0"
  },
  "devDependencies": {
    "@caixa1/config": "workspace:*",
    "@cloudflare/workers-types": "^4.20250403.0",
    "drizzle-kit": "^0.30.0",
    "eslint": "^9.17.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.18.0"
  }
}
```

### `packages/shared/package.json`

```json
{"name": "@caixa1/shared", "version": "0.0.0", "private": true, "type": "module", "main": "./src/index.ts", "types": "./src/index.ts", "exports": {".": "./src/index.ts"}, "scripts": {"typecheck": "tsc --noEmit", "lint": "eslint src", "clean": "rm -rf .turbo node_modules"}, "dependencies": {"zod": "^3.24.0"}, "devDependencies": {"@caixa1/config": "workspace:*", "@eslint/js": "^9.17.0", "eslint": "^9.17.0", "typescript": "^5.7.0", "typescript-eslint": "^8.18.0"}}
```

### `packages/core/package.json`

```json
{"name": "@caixa1/core", "version": "0.0.0", "private": true, "type": "module", "main": "./src/index.ts", "types": "./src/index.ts", "exports": {".": "./src/index.ts"}, "scripts": {"typecheck": "tsc --noEmit", "lint": "eslint src", "clean": "rm -rf .turbo node_modules"}, "dependencies": {"@caixa1/shared": "workspace:*", "@tanstack/react-query": "^5.62.0", "zustand": "^5.0.0"}, "peerDependencies": {"react": "^19.0.0"}, "devDependencies": {"@caixa1/config": "workspace:*", "@eslint/js": "^9.17.0", "@types/react": "^19.0.0", "eslint": "^9.17.0", "react": "^19.0.0", "typescript": "^5.7.0", "typescript-eslint": "^8.18.0"}}
```

### `packages/config/package.json`

```json
{"name": "@caixa1/config", "version": "0.0.0", "private": true, "type": "module", "files": ["tsconfig", "eslint"], "exports": {"./tsconfig/base": "./tsconfig/base.json", "./tsconfig/react": "./tsconfig/react.json", "./tsconfig/node": "./tsconfig/node.json", "./eslint": "./eslint/index.js"}, "devDependencies": {"@eslint/js": "^9.17.0", "typescript-eslint": "^8.18.0", "eslint": "^9.17.0"}}
```

### `packages/ui-contracts/package.json`

```json
{"name": "@caixa1/ui-contracts", "version": "0.0.0", "private": true, "type": "module", "main": "./src/index.ts", "types": "./src/index.ts", "exports": {".": "./src/index.ts"}, "scripts": {"typecheck": "tsc --noEmit", "lint": "eslint src", "clean": "rm -rf .turbo node_modules"}, "dependencies": {"react": "^19.0.0"}, "devDependencies": {"@caixa1/config": "workspace:*", "@eslint/js": "^9.17.0", "@types/react": "^19.0.0", "eslint": "^9.17.0", "typescript": "^5.7.0", "typescript-eslint": "^8.18.0"}}
```