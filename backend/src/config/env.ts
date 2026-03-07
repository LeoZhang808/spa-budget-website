import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  REFRESH_TOKEN_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  process.exit(1);
}

export const env = parsed.data;
