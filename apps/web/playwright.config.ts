import { defineConfig, devices } from '@playwright/test';

const isExternalServer = process.env.FRONTEND_RADAR_E2E_EXTERNAL_SERVER === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  ...(isExternalServer
    ? {}
    : {
        webServer: {
          command: 'npm run preview -- --host 127.0.0.1 --port 5173 --strictPort',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: 'http://127.0.0.1:5173',
        },
      }),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
