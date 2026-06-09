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
      expect(body.paths['/reports/analyze'].post.responses['403']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['404']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['429']).toBeDefined();
      expect(body.paths['/reports/analyze'].post.responses['502']).toBeDefined();
      expect(body.paths['/reports']).toBeDefined();
      expect(body.paths['/reports'].get.operationId).toBe('listReportAnalyses');
      expect(body.paths['/reports/{id}']).toBeDefined();
      expect(body.paths['/reports/{id}'].get.operationId).toBe('getReportAnalysis');
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
      expect(body.paths['/reports/{id}'].get.responses['404']).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
