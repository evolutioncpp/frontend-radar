import { describe, expect, it } from 'vitest';

import { buildApp } from '../app.js';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const resolveJsonPointer = (document: unknown, pointer: string) => {
  return pointer
    .replace(/^#\//, '')
    .split('/')
    .reduce<unknown>((value, segment) => {
      if (!isRecord(value)) {
        return undefined;
      }

      return value[segment];
    }, document);
};

const findFailedResponseSchema = (
  schema: unknown,
  document: unknown,
  visitedRefs = new Set<string>(),
): Record<string, unknown> | null => {
  if (!isRecord(schema)) {
    return null;
  }

  const ref = schema.$ref;

  if (typeof ref === 'string') {
    if (visitedRefs.has(ref)) {
      return null;
    }

    visitedRefs.add(ref);

    return findFailedResponseSchema(resolveJsonPointer(document, ref), document, visitedRefs);
  }

  const properties = schema.properties;

  if (isRecord(properties) && 'status' in properties && 'errorCode' in properties) {
    const statusSchema = properties.status;

    if (JSON.stringify(statusSchema).includes('failed') && 'errorMessage' in properties) {
      return schema;
    }
  }

  for (const key of ['oneOf', 'anyOf', 'allOf']) {
    const childSchemas = schema[key];

    if (!Array.isArray(childSchemas)) {
      continue;
    }

    for (const childSchema of childSchemas) {
      const failedSchema = findFailedResponseSchema(childSchema, document, visitedRefs);

      if (failedSchema) {
        return failedSchema;
      }
    }
  }

  return null;
};

const collectSchemasWithRequiredEvidence = (
  schema: unknown,
  document: unknown,
  visitedRefs = new Set<string>(),
): Array<Record<string, unknown>> => {
  if (!isRecord(schema)) {
    return [];
  }

  const ref = schema.$ref;

  if (typeof ref === 'string') {
    if (visitedRefs.has(ref)) {
      return [];
    }

    const nextVisitedRefs = new Set(visitedRefs);
    nextVisitedRefs.add(ref);

    return collectSchemasWithRequiredEvidence(
      resolveJsonPointer(document, ref),
      document,
      nextVisitedRefs,
    );
  }

  const schemas: Array<Record<string, unknown>> = [];
  const properties = schema.properties;
  const required = schema.required;

  if (isRecord(properties) && 'evidence' in properties && Array.isArray(required)) {
    if (required.includes('evidence')) {
      schemas.push(schema);
    }
  }

  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        schemas.push(...collectSchemasWithRequiredEvidence(child, document, visitedRefs));
      }

      continue;
    }

    schemas.push(...collectSchemasWithRequiredEvidence(value, document, visitedRefs));
  }

  return schemas;
};

const collectSchemasWithRequiredProperties = (
  schema: unknown,
  document: unknown,
  propertyNames: string[],
  visitedRefs = new Set<string>(),
): Array<Record<string, unknown>> => {
  if (!isRecord(schema)) {
    return [];
  }

  const ref = schema.$ref;

  if (typeof ref === 'string') {
    if (visitedRefs.has(ref)) {
      return [];
    }

    const nextVisitedRefs = new Set(visitedRefs);
    nextVisitedRefs.add(ref);

    return collectSchemasWithRequiredProperties(
      resolveJsonPointer(document, ref),
      document,
      propertyNames,
      nextVisitedRefs,
    );
  }

  const schemas: Array<Record<string, unknown>> = [];
  const properties = schema.properties;
  const required = schema.required;

  if (isRecord(properties) && Array.isArray(required)) {
    const hasAllProperties = propertyNames.every(
      (propertyName) => propertyName in properties && required.includes(propertyName),
    );

    if (hasAllProperties) {
      schemas.push(schema);
    }
  }

  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        schemas.push(
          ...collectSchemasWithRequiredProperties(child, document, propertyNames, visitedRefs),
        );
      }

      continue;
    }

    schemas.push(
      ...collectSchemasWithRequiredProperties(value, document, propertyNames, visitedRefs),
    );
  }

  return schemas;
};

describe('GET /openapi.json', () => {
  it('returns OpenAPI document with health and reports endpoints', async () => {
    const app = buildApp();

    try {
      const response = await app.inject({
        method: 'GET',
        url: '/openapi.json',
      });

      const body = response.json();

      expect(response.statusCode).toBe(200);
      expect(body.openapi).toBe('3.0.3');
      expect(body.info.title).toBe('Frontend Radar API');
      expect(body.paths['/health']).toBeDefined();
      expect(body.paths['/health'].get.operationId).toBe('getHealth');
      expect(body.paths['/reports/analyze']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.operationId).toBe('createReportAnalysis');
      expect(JSON.stringify(body.paths['/reports/analyze'].post.parameters)).toContain(
        'accept-language',
      );
      expect(JSON.stringify(body.paths['/reports/analyze'].post.requestBody)).toContain('branch');
      expect(JSON.stringify(body.paths['/reports/analyze'].post.requestBody)).toContain(
        'projectPathSource',
      );
      expect(body.paths['/reports/analyze'].post.responses['403']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['404']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['429']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['422']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['502']).toBeDefined();
      expect(body.paths['/repositories/{owner}/{repository}/branches']).toBeDefined();
      expect(body.paths['/repositories/{owner}/{repository}/branches'].get.operationId).toBe(
        'listRepositoryBranches',
      );
      expect(
        JSON.stringify(
          body.paths['/repositories/{owner}/{repository}/branches'].get.responses['200'].content[
            'application/json'
          ].schema,
        ),
      ).toContain('defaultBranch');
      expect(body.paths['/reports']).toBeDefined();
      expect(body.paths['/reports'].get.operationId).toBe('listReportAnalyses');
      expect(body.paths['/reports/{id}']).toBeDefined();
      expect(body.paths['/reports/{id}'].get.operationId).toBe('getReportAnalysis');
      expect(JSON.stringify(body.paths['/reports/{id}'].get.parameters)).toContain(
        'accept-language',
      );
      expect(body.paths['/reports/{id}/refresh']).toBeDefined();
      expect(body.paths['/reports/{id}/refresh'].post.operationId).toBe(
        'forceRefreshReportAnalysis',
      );
      expect(body.paths['/reports/{id}/refresh'].post.responses['409']).toBeDefined();
      expect(
        JSON.stringify(
          body.paths['/reports/{id}/refresh'].post.responses['200'].content['application/json']
            .schema,
        ),
      ).toContain('up_to_date');
      expect(body.paths['/reports/{id}/comparison']).toBeDefined();
      expect(body.paths['/reports/{id}/comparison'].get.operationId).toBe('getReportComparison');
      expect(JSON.stringify(body.paths['/reports/{id}/comparison'].get.parameters)).toContain(
        'previousId',
      );
      expect(
        JSON.stringify(
          body.paths['/reports/{id}/comparison'].get.responses['200'].content['application/json']
            .schema,
        ),
      ).toContain('persistentCount');
      expect(
        JSON.stringify(
          body.paths['/reports'].get.responses['200'].content['application/json'].schema,
        ),
      ).toContain('latestCommitTitle');
      expect(
        JSON.stringify(
          body.paths['/reports'].get.responses['200'].content['application/json'].schema,
        ),
      ).toContain('branch');
      expect(
        JSON.stringify(
          body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
        ),
      ).toContain('latestCommitTitle');
      expect(
        JSON.stringify(
          body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
        ),
      ).toContain('branch');
      expect(
        JSON.stringify(
          body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
        ),
      ).toContain('projectDetection');
      expect(
        collectSchemasWithRequiredProperties(
          body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
          body,
          ['analysisSources', 'tooling', 'totalScore'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        findFailedResponseSchema(
          body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
          body,
        ),
      ).toMatchObject({
        properties: {
          errorCode: expect.any(Object),
          errorMessage: expect.any(Object),
          status: expect.any(Object),
        },
        required: expect.arrayContaining(['id', 'status', 'errorCode', 'errorMessage']),
      });
      const evidenceSchemas = collectSchemasWithRequiredEvidence(
        body.paths['/reports/{id}'].get.responses['200'].content['application/json'].schema,
        body,
      );
      const isMetricSchema = (schema: Record<string, unknown>) => {
        const properties = schema.properties;

        return isRecord(properties) && 'category' in properties && 'value' in properties;
      };
      const isCheckSchema = (schema: Record<string, unknown>) => {
        const properties = schema.properties;

        return isRecord(properties) && 'id' in properties && 'label' in properties;
      };

      expect(evidenceSchemas.some(isMetricSchema)).toBe(true);
      expect(evidenceSchemas.some(isCheckSchema)).toBe(false);
      expect(body.paths['/reports/{id}'].get.responses['404']).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
