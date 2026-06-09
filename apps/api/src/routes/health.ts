import { z } from 'zod/v4';

import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['System'],
        operationId: 'getHealth',
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => ({ status: 'ok' as const }),
  );
};
