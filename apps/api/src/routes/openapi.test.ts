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

    if (schemaContainsLiteral(statusSchema, document, 'failed') && 'errorMessage' in properties) {
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

const collectSchemasWithProperties = (
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

    return collectSchemasWithProperties(
      resolveJsonPointer(document, ref),
      document,
      propertyNames,
      nextVisitedRefs,
    );
  }

  const schemas: Array<Record<string, unknown>> = [];
  const properties = schema.properties;

  if (isRecord(properties) && propertyNames.every((propertyName) => propertyName in properties)) {
    schemas.push(schema);
  }

  for (const value of Object.values(schema)) {
    if (Array.isArray(value)) {
      for (const child of value) {
        schemas.push(...collectSchemasWithProperties(child, document, propertyNames, visitedRefs));
      }

      continue;
    }

    schemas.push(...collectSchemasWithProperties(value, document, propertyNames, visitedRefs));
  }

  return schemas;
};

const schemaContainsLiteral = (
  schema: unknown,
  document: unknown,
  expectedValue: string,
  visitedRefs = new Set<string>(),
): boolean => {
  if (!isRecord(schema)) {
    return false;
  }

  const ref = schema.$ref;

  if (typeof ref === 'string') {
    if (visitedRefs.has(ref)) {
      return false;
    }

    const nextVisitedRefs = new Set(visitedRefs);
    nextVisitedRefs.add(ref);

    return schemaContainsLiteral(
      resolveJsonPointer(document, ref),
      document,
      expectedValue,
      nextVisitedRefs,
    );
  }

  if (schema.const === expectedValue) {
    return true;
  }

  if (Array.isArray(schema.enum) && schema.enum.includes(expectedValue)) {
    return true;
  }

  return Object.values(schema).some((value) => {
    if (Array.isArray(value)) {
      return value.some((child) =>
        schemaContainsLiteral(child, document, expectedValue, visitedRefs),
      );
    }

    return schemaContainsLiteral(value, document, expectedValue, visitedRefs);
  });
};

const getJsonResponseSchema = (
  document: Record<string, unknown>,
  pathName: string,
  method: 'get' | 'post',
  statusCode = '200',
) => {
  const paths = document.paths;

  if (!isRecord(paths)) {
    return undefined;
  }

  const pathItem = paths[pathName];

  if (!isRecord(pathItem)) {
    return undefined;
  }

  const operation = pathItem[method];

  if (!isRecord(operation) || !isRecord(operation.responses)) {
    return undefined;
  }

  const response = operation.responses[statusCode];

  if (!isRecord(response) || !isRecord(response.content)) {
    return undefined;
  }

  const jsonContent = response.content['application/json'];

  return isRecord(jsonContent) ? jsonContent.schema : undefined;
};

const getJsonRequestBodySchema = (
  document: Record<string, unknown>,
  pathName: string,
  method: 'get' | 'post',
) => {
  const paths = document.paths;

  if (!isRecord(paths)) {
    return undefined;
  }

  const pathItem = paths[pathName];

  if (!isRecord(pathItem)) {
    return undefined;
  }

  const operation = pathItem[method];

  if (!isRecord(operation) || !isRecord(operation.requestBody)) {
    return undefined;
  }

  const requestBody = operation.requestBody;

  if (!isRecord(requestBody.content)) {
    return undefined;
  }

  const jsonContent = requestBody.content['application/json'];

  return isRecord(jsonContent) ? jsonContent.schema : undefined;
};

const hasParameter = (
  document: Record<string, unknown>,
  pathName: string,
  method: 'get' | 'post',
  parameterName: string,
) => {
  const paths = document.paths;

  if (!isRecord(paths)) {
    return false;
  }

  const pathItem = paths[pathName];

  if (!isRecord(pathItem)) {
    return false;
  }

  const operation = pathItem[method];

  if (!isRecord(operation) || !Array.isArray(operation.parameters)) {
    return false;
  }

  return operation.parameters.some((parameter) => {
    if (!isRecord(parameter)) {
      return false;
    }

    const resolvedParameter =
      typeof parameter.$ref === 'string' ? resolveJsonPointer(document, parameter.$ref) : parameter;

    return isRecord(resolvedParameter) && resolvedParameter.name === parameterName;
  });
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
      expect(hasParameter(body, '/reports/analyze', 'post', 'accept-language')).toBe(true);
      expect(
        collectSchemasWithProperties(
          getJsonRequestBodySchema(body, '/reports/analyze', 'post'),
          body,
          ['branch', 'projectPathSource'],
        ),
      ).toHaveLength(1);
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
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/repositories/{owner}/{repository}/branches', 'get'),
          body,
          ['defaultBranch', 'branches', 'isTruncated'],
        ),
      ).toHaveLength(1);
      expect(body.paths['/reports']).toBeDefined();
      expect(body.paths['/reports'].get.operationId).toBe('listReportAnalyses');
      expect(body.paths['/reports/{id}']).toBeDefined();
      expect(body.paths['/reports/{id}'].get.operationId).toBe('getReportAnalysis');
      expect(hasParameter(body, '/reports/{id}', 'get', 'accept-language')).toBe(true);
      expect(body.paths['/reports/{id}/refresh']).toBeDefined();
      expect(body.paths['/reports/{id}/refresh'].post.operationId).toBe(
        'forceRefreshReportAnalysis',
      );
      expect(body.paths['/reports/{id}/refresh'].post.responses['409']).toBeDefined();
      expect(
        schemaContainsLiteral(
          getJsonResponseSchema(body, '/reports/{id}/refresh', 'post'),
          body,
          'up_to_date',
        ),
      ).toBe(true);
      expect(body.paths['/reports/{id}/retry']).toBeDefined();
      expect(body.paths['/reports/{id}/retry'].post.operationId).toBe('retryReportAnalysis');
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}/retry', 'post'),
          body,
          ['id', 'status', 'retryReason'],
        ),
      ).toHaveLength(1);
      expect(body.paths['/reports/{id}/comparison']).toBeDefined();
      expect(body.paths['/reports/{id}/comparison'].get.operationId).toBe('getReportComparison');
      expect(hasParameter(body, '/reports/{id}/comparison', 'get', 'previousId')).toBe(true);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}/comparison', 'get'),
          body,
          ['added', 'resolved', 'persistentCount'],
        ),
      ).toHaveLength(1);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports', 'get'), body, [
          'latestCommitTitle',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports', 'get'), body, [
          'branch',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports/{id}', 'get'), body, [
          'latestCommitTitle',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports/{id}', 'get'), body, [
          'branch',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports/{id}', 'get'), body, [
          'projectDetection',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports/{id}', 'get'), body, [
          'analysis',
        ]),
      ).not.toHaveLength(0);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}', 'get'),
          body,
          ['owner', 'repository', 'normalizedUrl', 'branch', 'updatedAt'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}', 'get'),
          body,
          ['analysisSources', 'tooling', 'totalScore'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}', 'get'),
          body,
          ['category', 'scoreDetails'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}', 'get'),
          body,
          ['rawValue', 'finalValue', 'weight', 'impactLevel', 'checks'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        collectSchemasWithRequiredProperties(
          getJsonResponseSchema(body, '/reports/{id}', 'get'),
          body,
          ['raw', 'kind', 'label'],
        ).length,
      ).toBeGreaterThan(0);
      expect(
        findFailedResponseSchema(getJsonResponseSchema(body, '/reports/{id}', 'get'), body),
      ).toMatchObject({
        properties: {
          errorCode: expect.any(Object),
          errorMessage: expect.any(Object),
          status: expect.any(Object),
        },
        required: expect.arrayContaining(['id', 'status', 'errorCode', 'errorMessage']),
      });
      expect(
        collectSchemasWithProperties(getJsonResponseSchema(body, '/reports/{id}', 'get'), body, [
          'evidence',
        ]),
      ).toHaveLength(0);
      expect(body.paths['/reports/{id}'].get.responses['404']).toBeDefined();
    } finally {
      await app.close();
    }
  });
});
