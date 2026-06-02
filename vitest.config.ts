import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/shared/config/tests/setup-tests.ts'],
    css: true,

    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'e2e/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'dist/**',
        'coverage/**',
        'storybook-static/**',
        'playwright-report/**',
        'test-results/**',
        'e2e/**',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
});
