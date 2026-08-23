import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  TRUSTED_PROXY_IPS: z.string().optional(),
});

const env = envSchema.parse(process.env);

const trustedProxies = env.TRUSTED_PROXY_IPS
  ? env.TRUSTED_PROXY_IPS.split(",").map((ip) => ip.trim()).filter(Boolean)
  : [];

export const config = {
  database: {
    url: env.DATABASE_URL,
  },
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
    trustProxy: trustedProxies.length > 0 ? trustedProxies : false,
  },
  clerk: {
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
  },
} as const;
