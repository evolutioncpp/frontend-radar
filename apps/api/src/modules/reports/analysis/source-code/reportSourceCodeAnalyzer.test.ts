import { describe, expect, it } from 'vitest';

import { analyzeSourceCode } from './reportSourceCodeAnalyzer.js';

describe('analyzeSourceCode', () => {
  it('detects entrypoints, lazy imports, error boundaries and code health warnings', () => {
    const signals = analyzeSourceCode({
      isTruncated: false,
      sources: ['apps/web/src/main.tsx'],
      files: [
        {
          path: 'apps/web/src/main.tsx',
          kind: 'source',
          content: "import('./App'); console.log('debug');",
        },
        {
          path: 'apps/web/src/ErrorBoundary.tsx',
          kind: 'source',
          content:
            'class ErrorBoundary { componentDidCatch() {} } // TODO: cleanup\nconst x: any = 1;',
        },
        {
          path: 'apps/web/vite.config.ts',
          kind: 'config',
          content: "console.log('config'); // TODO config\nconst plugin: any = {};",
        },
        {
          path: 'apps/web/src/App.test.tsx',
          kind: 'test',
          content: "console.log('test'); // TODO test\nconst value: any = {};",
        },
      ],
    });

    expect(signals.entrypoints).toMatchObject({
      found: true,
      sources: ['apps/web/src/main.tsx'],
    });
    expect(signals.codeSplitting).toMatchObject({
      found: true,
      sources: ['apps/web/src/main.tsx'],
    });
    expect(signals.errorBoundaries).toMatchObject({
      found: true,
      sources: ['apps/web/src/ErrorBoundary.tsx'],
    });
    expect(signals.codeHealth).toMatchObject({
      anyCount: 1,
      consoleCount: 1,
      issueCount: 3,
      todoCount: 1,
    });
    expect(signals.files).toMatchObject({
      count: 2,
      sources: ['apps/web/src/main.tsx', 'apps/web/src/ErrorBoundary.tsx'],
    });
  });
});
