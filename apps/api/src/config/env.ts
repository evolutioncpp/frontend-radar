import { z } from 'zod';

const DEFAULT_DATABASE_URL =
  'postgresql://frontend_radar:frontend_radar@localhost:5432/frontend_radar?schema=public';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('127.0.0.1'),
  DATABASE_URL: z.string().url().default(DEFAULT_DATABASE_URL),
  GITHUB_API_BASE_URL: z.string().url().default('https://api.github.com'),
  GITHUB_TOKEN: z.string().min(1).optional(),
  WEB_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
