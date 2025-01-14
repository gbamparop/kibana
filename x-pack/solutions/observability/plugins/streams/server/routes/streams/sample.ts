/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from '@kbn/zod';
import { notFound, internal } from '@hapi/boom';
import { errors } from '@elastic/elasticsearch';
import { conditionSchema, isCompleteCondition } from '@kbn/streams-schema';
import { createServerRoute } from '../create_server_route';
import { DefinitionNotFound } from '../../lib/streams/errors';
import { checkAccess } from '../../lib/streams/stream_crud';
import { conditionToQueryDsl } from '../../lib/streams/helpers/condition_to_query_dsl';
import { getFields } from '../../lib/streams/helpers/condition_fields';

export const sampleStreamRoute = createServerRoute({
  endpoint: 'POST /api/streams/{id}/_sample',
  options: {
    access: 'internal',
  },
  security: {
    authz: {
      enabled: false,
      reason:
        'This API delegates security to the currently logged in user and their Elasticsearch permissions.',
    },
  },
  params: z.object({
    path: z.object({ id: z.string() }),
    body: z.object({
      condition: z.optional(conditionSchema),
      start: z.optional(z.number()),
      end: z.optional(z.number()),
      number: z.optional(z.number()),
    }),
  }),
  handler: async ({ params, request, getScopedClients }): Promise<{ documents: unknown[] }> => {
    try {
      const { scopedClusterClient } = await getScopedClients({ request });

      const { read } = await checkAccess({ id: params.path.id, scopedClusterClient });
      if (!read) {
        throw new DefinitionNotFound(`Stream definition for ${params.path.id} not found.`);
      }
      const searchBody = {
        query: {
          bool: {
            must: [
              isCompleteCondition(params.body.condition)
                ? conditionToQueryDsl(params.body.condition)
                : { match_all: {} },
              {
                range: {
                  '@timestamp': {
                    gte: params.body.start,
                    lte: params.body.end,
                    format: 'epoch_millis',
                  },
                },
              },
            ],
          },
        },
        // Conditions could be using fields which are not indexed or they could use it with other types than they are eventually mapped as.
        // Because of this we can't rely on mapped fields to draw a sample, instead we need to use runtime fields to simulate what happens during
        // ingest in the painless condition checks.
        // This is less efficient than it could be - in some cases, these fields _are_ indexed with the right type and we could use them directly.
        // This can be optimized in the future.
        runtime_mappings: Object.fromEntries(
          getFields(params.body.condition).map((field) => [
            field.name,
            { type: field.type === 'string' ? 'keyword' : 'double' },
          ])
        ),
        sort: [
          {
            '@timestamp': {
              order: 'desc',
            },
          },
        ],
        size: params.body.number,
      };
      const results = await scopedClusterClient.asCurrentUser.search({
        index: params.path.id,
        allow_no_indices: true,
        ...searchBody,
      });

      return { documents: results.hits.hits.map((hit) => hit._source) };
    } catch (error) {
      if (error instanceof errors.ResponseError && error.meta.statusCode === 404) {
        throw notFound(error);
      }
      if (error instanceof DefinitionNotFound) {
        throw notFound(error);
      }

      throw internal(error);
    }
  },
});
