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
import { GithubReportAnalyzer } from './modules/reports/analysis/githubReportAnalyzer.js';
import { createReportApplicationService } from './modules/reports/application/reportApplicationService.js';
import {
  recoverReportAnalyses,
  startReportAnalysisSafely,
} from './modules/reports/application/reportAnalysisWorker.js';
import type { ReportAnalyzer } from './modules/reports/application/ports/reportAnalyzer.js';
import type { ReportAnalyzerRequestContext } from './modules/reports/application/ports/reportAnalyzer.js';
import type {
  ReportAnalysisEntity,
  ReportAnalysisRepository,
} from './modules/reports/application/ports/reportAnalysisRepository.js';
import { PrismaReportAnalysisRepository } from './modules/reports/infrastructure/persistence/prismaReportAnalysisRepository.js';
import { healthRoutes } from './routes/health.js';
import { createReportRoutes } from './routes/reports.js';

interface AppDependencies {
  reportAnalysisRepository?: ReportAnalysisRepository;
  reportAnalyzer?: ReportAnalyzer;
  recoverOnStart?: boolean;
  startReportAnalysis?: (
    analysis: ReportAnalysisEntity,
    context?: ReportAnalyzerRequestContext,
  ) => void;
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
  const recoverOnStart = dependencies.recoverOnStart ?? env.NODE_ENV !== 'test';
  const runReportAnalysis =
    dependencies.startReportAnalysis ??
    ((analysis: ReportAnalysisEntity, context?: ReportAnalyzerRequestContext) => {
      startReportAnalysisSafely({
        analysis,
        analyzer: reportAnalyzer,
        context,
        logger: app.log,
        repository: reportAnalysisRepository,
      });
    });
  const reportApplication = createReportApplicationService({
    analyzer: reportAnalyzer,
    repository: reportAnalysisRepository,
    startAnalysis: runReportAnalysis,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    allowedHeaders: ['Accept', 'Accept-Language', 'Content-Type', 'x-github-token'],
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
  typedApp.register(createReportRoutes({ reports: reportApplication }));

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
