/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { SavedObjectsClient } from '@kbn/core/server';
import { DatasetQualityDataTelemetry } from '../types';
import { TelemetryClient } from '../telemetry_client';

type ISavedObjectsClient = Pick<SavedObjectsClient, 'find'>;
const TIME_RANGES = ['1d', 'all'] as const;
// type TimeRange = typeof TIME_RANGES[number];

const range1d = { range: { '@timestamp': { gte: 'now-1d' } } };
const timeout = '5m';

interface TelemetryTask {
  name: string;
  executor: (params: TelemetryTaskExecutorParams) => Promise<DatasetQualityDataTelemetry>;
}

export interface TelemetryTaskExecutorParams {
  telemetryClient: TelemetryClient;
  indices: string[];
  savedObjectsClient: ISavedObjectsClient;
}

export const tasks: TelemetryTask[] = [
  {
    name: 'test',
    executor: async ({ indices, telemetryClient }) => {
      try {
        debugger;
        const response = await telemetryClient.search({
          index: 'traces-apm*',
          body: {
            track_total_hits: false,
            size: 1,
            timeout,
          },
        });
        debugger;

        return {
          test: 'test',
        };
      } catch (e) {
        debugger;
        return {
          test: 'test',
        };
      }
    },
  },
  {
    name: 'environments',
    executor: async ({ indices, telemetryClient }) => {
      const response = await telemetryClient.search({
        index: 'logs-*-*',
        body: {
          track_total_hits: false,
          size: 0,
          timeout,
          query: {
            bool: {
              filter: [range1d],
            },
          },
          aggs: {
            services: {
              terms: {
                field: 'service.name',
                size: 5,
              },
            },
          },
        },
      });

      console.log(JSON.stringify(response.aggregations?.services), null, 2);

      return {
        environments: {
          top_environments: (response.aggregations?.services.buckets.map((bucket) => bucket.key) ??
            []) as string[],
        },
      };
    },
  },
];
