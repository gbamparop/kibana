/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { MakeSchemaFrom } from '@kbn/usage-collection-plugin/server';
import { DatasetQualityUsage } from './types';

export const datasetQualitySchema: MakeSchemaFrom<DatasetQualityUsage, true> = {
  environments: {
    top_environments: {
      type: 'array',
      items: {
        type: 'keyword',
        _meta: {
          description:
            'An array of the top 5 environments in terms of document count within tha last day',
        },
      },
    },
  },
  test: {
    type: 'text',
    _meta: {
      description: 'test',
    },
  },
  tasks: {
    environments: {
      took: {
        ms: {
          type: 'long',
          _meta: {
            description: 'Execution time in milliseconds for the "environments" task',
          },
        },
      },
    },
    test: {
      took: {
        ms: {
          type: 'long',
          _meta: {
            description: 'test',
          },
        },
      },
    },
  },
};
