/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DeepPartial } from 'utility-types';

interface TimeframeMap {
  '1d': number;
  all: number;
}

// export type TimeframeMap1d = Pick<TimeframeMap, '1d'>;
// export type TimeframeMapAll = Pick<TimeframeMap, 'all'>;

export interface DatasetQualityUsage {
  environments: {
    top_environments: string[];
  };
  test: string;
  tasks: Record<'environments' | 'test', { took: { ms: number } }>;
}

export type DatasetQualityDataTelemetry = DeepPartial<DatasetQualityUsage>;

export type DatasetQualityTelemetry = DatasetQualityDataTelemetry;
