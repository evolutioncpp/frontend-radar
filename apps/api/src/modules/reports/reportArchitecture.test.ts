import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const currentFilePath = fileURLToPath(import.meta.url);
const reportsRoot = path.resolve(path.dirname(currentFilePath));
const apiSrcRoot = path.resolve(reportsRoot, '..', '..');
const reportsRoutePath = path.resolve(apiSrcRoot, 'routes', 'reports.ts');

const productionFileNames = (directory: string): string[] => {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return productionFileNames(fullPath);
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name.endsWith('.test.ts')) {
      return [];
    }

    return [fullPath];
  });
};

const moduleSpecifierPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/g;

const readRelativeImports = (filePath: string) => {
  const source = readFileSync(filePath, 'utf8');
  const imports: string[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = moduleSpecifierPattern.exec(source))) {
    const specifier = match[1];

    if (specifier?.startsWith('.')) {
      imports.push(specifier);
    }
  }

  return imports;
};

const resolveImportPath = (fromFilePath: string, specifier: string) => {
  const resolvedPath = path.resolve(path.dirname(fromFilePath), specifier.replace(/\.js$/, '.ts'));

  return path.normalize(resolvedPath);
};

const getReportsLayer = (filePath: string) => {
  const relativePath = path.relative(reportsRoot, filePath);
  const [layer] = relativePath.split(path.sep);

  return layer ?? '';
};

const describePath = (filePath: string) => path.relative(apiSrcRoot, filePath).replace(/\\/g, '/');

const findForbiddenLayerImports = (
  sourceFiles: string[],
  forbiddenByLayer: Partial<Record<string, string[]>>,
) => {
  return sourceFiles.flatMap((sourceFile) => {
    const sourceLayer = getReportsLayer(sourceFile);
    const forbiddenLayers = forbiddenByLayer[sourceLayer] ?? [];

    return readRelativeImports(sourceFile).flatMap((specifier) => {
      const importedPath = resolveImportPath(sourceFile, specifier);

      if (!importedPath.startsWith(reportsRoot)) {
        return [];
      }

      const importedLayer = getReportsLayer(importedPath);

      if (!forbiddenLayers.includes(importedLayer)) {
        return [];
      }

      return [`${describePath(sourceFile)} -> ${describePath(importedPath)}`];
    });
  });
};

describe('reports module architecture', () => {
  it('keeps reports routes as a thin HTTP layer', () => {
    const forbiddenImports = readRelativeImports(reportsRoutePath)
      .map((specifier) => resolveImportPath(reportsRoutePath, specifier))
      .filter((importedPath) => importedPath.startsWith(reportsRoot))
      .filter((importedPath) =>
        ['analysis', 'infrastructure', 'scoring'].includes(getReportsLayer(importedPath)),
      )
      .map((importedPath) => `${describePath(reportsRoutePath)} -> ${describePath(importedPath)}`);

    expect(forbiddenImports).toEqual([]);
  });

  it('keeps report layer dependencies from leaking backwards', () => {
    const sourceFiles = productionFileNames(reportsRoot);
    const forbiddenImports = findForbiddenLayerImports(sourceFiles, {
      analysis: ['infrastructure'],
      application: ['analysis', 'infrastructure', 'scoring'],
      domain: ['application', 'infrastructure', 'localization', 'scoring'],
      infrastructure: ['analysis', 'localization', 'scoring'],
      localization: ['application', 'infrastructure'],
      scoring: ['application', 'infrastructure', 'localization'],
    });

    expect(forbiddenImports).toEqual([]);
  });
});
