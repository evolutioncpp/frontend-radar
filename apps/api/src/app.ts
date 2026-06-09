import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import Fastify, { type FastifyServerOptions } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { env } from './config/env.js';
import { openApiConfig } from './config/openapi.js';
import { prisma } from './config/prisma.js';
import {
  GithubReportAnalyzer,
  type ReportAnalyzer,
} from './modules/reports/githubReportAnalyzer.js';
import { recoverReportAnalyses } from './modules/reports/reportAnalysisWorker.js';
import {
  PrismaReportAnalysisRepository,
  type ReportAnalysisRepository,
} from './modules/reports/reportAnalysisRepository.js';
import { healthRoutes } from './routes/health.js';
import { createReportRoutes } from './routes/reports.js';

interface AppDependencies {
  reportAnalysisRepository?: ReportAnalysisRepository;
  reportAnalyzer?: ReportAnalyzer;
  recoverOnStart?: boolean;
}

export const buildApp = (
  options: FastifyServerOptions = {},
  dependencies: AppDependencies = {},
) => {
  const app = Fastify(options);
  const typedApp = app.withTypeProvider<ZodTypeProvider>();
  const reportAnalysisRepository =
    dependencies.reportAnalysisRepository ?? new PrismaReportAnalysisRepository(prisma);
  const reportAnalyzer = dependencies.reportAnalyzer ?? new GithubReportAnalyzer();
  const recoverOnStart = dependencies.recoverOnStart ?? process.env.NODE_ENV !== 'test';

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: env.WEB_ORIGIN,
  });

  app.register(swagger, {
    openapi: openApiConfig,
    transform: jsonSchemaTransform,
  });

  app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  typedApp.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
      },
    },
    async () => app.swagger(),
  );

  typedApp.register(healthRoutes);
  typedApp.register(
    createReportRoutes({
      analyzer: reportAnalyzer,
      repository: reportAnalysisRepository,
    }),
  );

  if (recoverOnStart) {
    app.addHook('onReady', async () => {
      await recoverReportAnalyses({
        analyzer: reportAnalyzer,
        logger: app.log,
        repository: reportAnalysisRepository,
      });
    });
  }

  app.addHook('onClose', async () => {
    if (!dependencies.reportAnalysisRepository) {
      await prisma.$disconnect();
    }
  });

  return app;
};
