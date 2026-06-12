import { z } from 'zod';

const DEFAULT_DATABASE_URL =
  'postgresql://frontend_radar:frontend_radar@localhost:5432/frontend_radar?schema=public';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('127.0.0.1'),
  DATABASE_URL: z.string().url().optional(),
  GITHUB_API_BASE_URL: z.string().url().default('https://api.github.com'),
  GITHUB_TOKEN: z.string().min(1).optional(),
  REPORT_ANALYSIS_LEASE_TTL_MS: z.coerce.number().int().positive().default(300000),
  REPORT_ANALYSIS_RECOVERY_BATCH_LIMIT: z.coerce.number().int().positive().default(25),
  WEB_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

export const createEnv = (source: NodeJS.ProcessEnv) => {
  const parsedEnv = envSchema.parse(source);

  if (parsedEnv.NODE_ENV === 'production' && !parsedEnv.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when NODE_ENV=production');
  }

  return {
    ...parsedEnv,
    DATABASE_URL: parsedEnv.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  };
};

export const env = createEnv(process.env);
