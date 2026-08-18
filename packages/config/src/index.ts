import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
});

const env = envSchema.parse(process.env);

export const config = {
  database: {
    url: env.DATABASE_URL,
  },
} as const;
