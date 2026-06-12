import { describe, expect, it } from 'vitest';

import { createEnv } from './env.js';

describe('env config', () => {
  it('uses development database default outside production', () => {
    expect(createEnv({}).DATABASE_URL).toBe(
      'postgresql://frontend_radar:frontend_radar@localhost:5432/frontend_radar?schema=public',
    );
  });

  it('requires DATABASE_URL in production', () => {
    expect(() => createEnv({ NODE_ENV: 'production' })).toThrow(
      'DATABASE_URL is required when NODE_ENV=production',
    );
  });

  it('rejects unsafe report analysis lease ttl values', () => {
    expect(() =>
      createEnv({
        REPORT_ANALYSIS_LEASE_TTL_MS: '2',
      }),
    ).toThrow();
  });

  it('parses report analysis worker runtime settings', () => {
    expect(
      createEnv({
        DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
        REPORT_ANALYSIS_LEASE_TTL_MS: '600000',
        REPORT_ANALYSIS_RECOVERY_BATCH_LIMIT: '50',
      }),
    ).toMatchObject({
      REPORT_ANALYSIS_LEASE_TTL_MS: 600000,
      REPORT_ANALYSIS_RECOVERY_BATCH_LIMIT: 50,
    });
  });
});
