/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  schemaFile: 'http://localhost:3001/openapi.json',
  apiFile: './src/shared/api/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/shared/api/generatedApi.ts',
  exportName: 'generatedApi',
  hooks: { queries: true, lazyQueries: true, mutations: true },
  tag: true,
  endpointOverrides: [
    {
      pattern: () => true,
      parameterFilter: (parameterName, parameterDefinition) =>
        !(
          parameterDefinition.in === 'header' &&
          ['accept-language', 'authorization'].includes(parameterName.toLowerCase())
        ),
    },
  ],
};

module.exports = config;
