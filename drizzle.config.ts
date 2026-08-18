import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/database/src/schema/**/*.ts",
  out: "./packages/database/src/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
