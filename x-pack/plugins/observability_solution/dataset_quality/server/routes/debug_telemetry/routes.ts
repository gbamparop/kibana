/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { DATASET_QUALITY_TELEMETRY_TASK_NAME } from '../../lib/dataset_quality_telemetry';
import { DatasetQualityTelemetry } from '../../lib/dataset_quality_telemetry/types';
import {
  DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_ID,
  DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
} from '../../saved_objects/dataset_quality_telemetry';
import { createDatasetQualityServerRoute } from '../create_datasets_quality_server_route';

const debugTelemetryRoute = createDatasetQualityServerRoute({
  endpoint: 'GET /internal/dataset_quality/debug-telemetry',
  options: {
    tags: [],
  },
  async handler(resources): Promise<DatasetQualityTelemetry | unknown> {
    const { context, plugins } = resources;
    const coreContext = await context.core;

    const taskManagerStart = await plugins.taskManager?.start();
    const savedObjectsClient = coreContext.savedObjects.client;

    await taskManagerStart?.runSoon?.(DATASET_QUALITY_TELEMETRY_TASK_NAME);

    const apmTelemetryObject = await savedObjectsClient.get(
      DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
      DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_ID
    );

    return apmTelemetryObject.attributes;
  },
});

export const debugTelemetryRouteRepository = {
  ...debugTelemetryRoute,
};
