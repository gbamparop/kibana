/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { UsageCollectionSetup } from '@kbn/usage-collection-plugin/server';
import { CoreSetup, Logger, SavedObjectsErrorHelpers } from '@kbn/core/server';
import {
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '@kbn/task-manager-plugin/server';
import { collectDataTelemetry } from './collect_data_telemetry';
import { DatasetQualityUsage } from './types';
import { datasetQualitySchema } from './schema';
import { getTelemetryClient } from './telemetry_client';
import {
  DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_ID,
  DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
} from '../../saved_objects/dataset_quality_telemetry';
import { getInternalSavedObjectsClient } from '../../utils/get_internal_saved_objects_client';

export const DATASET_QUALITY_TELEMETRY_TASK_NAME = 'datasetQualityTelemetryTask';

export async function createDatasetQualityTelemetry({
  core,
  usageCollector,
  taskManager,
  logger,
  kibanaVersion,
  isProd,
}: {
  core: CoreSetup;
  usageCollector: UsageCollectionSetup;
  taskManager: TaskManagerSetupContract;
  logger: Logger;
  kibanaVersion: string;
  isProd: boolean;
}) {
  taskManager.registerTaskDefinitions({
    [DATASET_QUALITY_TELEMETRY_TASK_NAME]: {
      title: 'Collect Dataset Quality usage',
      createTaskRunner: () => {
        return {
          run: async () => {
            await collectAndStore();
          },
          cancel: async () => {},
        };
      },
    },
  });

  const telemetryClient = await getTelemetryClient({ core });
  const [coreStart] = await core.getStartServices();
  const savedObjectsClient = await getInternalSavedObjectsClient(coreStart);

  const collectAndStore = async () => {
    const dataTelemetry = await collectDataTelemetry({
      indices: ['logs-*-*'],
      telemetryClient,
      logger,
      savedObjectsClient,
      isProd,
    });

    await savedObjectsClient.create(
      DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
      {
        ...dataTelemetry,
        kibanaVersion,
      },
      { id: DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE, overwrite: true }
    );
  };

  const collector = usageCollector.makeUsageCollector<DatasetQualityUsage | {}>({
    type: 'dataset_quality',
    schema: datasetQualitySchema,
    fetch: async () => {
      try {
        const { kibanaVersion: storedKibanaVersion, ...data } = (
          await savedObjectsClient.get(
            DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
            DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_ID
          )
        ).attributes as { kibanaVersion: string } & DatasetQualityUsage;

        return data;
      } catch (err) {
        if (SavedObjectsErrorHelpers.isNotFoundError(err)) {
          // task has not run yet, so no saved object to return
          return {};
        }
        throw err;
      }
    },
    isReady: () => true,
  });

  usageCollector.registerCollector(collector);

  core.getStartServices().then(async ([_coreStart, pluginsStart]) => {
    const { taskManager: taskManagerStart } = pluginsStart as {
      taskManager: TaskManagerStartContract;
    };

    taskManagerStart.ensureScheduled({
      id: DATASET_QUALITY_TELEMETRY_TASK_NAME,
      taskType: DATASET_QUALITY_TELEMETRY_TASK_NAME,
      schedule: {
        interval: '720m',
      },
      scope: ['dataset_quality'],
      params: {},
      state: {},
    });

    try {
      const currentData = (
        await savedObjectsClient.get(
          DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_TYPE,
          DATASET_QUALITY_TELEMETRY_SAVED_OBJECT_ID
        )
      ).attributes as { kibanaVersion?: string };

      if (currentData.kibanaVersion !== kibanaVersion) {
        logger.debug(
          `Stored telemetry is out of date. Task will run immediately. Stored: ${currentData.kibanaVersion}, expected: ${kibanaVersion}`
        );
        await taskManagerStart.runSoon(DATASET_QUALITY_TELEMETRY_TASK_NAME);
      }
    } catch (err) {
      if (!SavedObjectsErrorHelpers.isNotFoundError(err)) {
        logger.warn('Failed to fetch saved telemetry data.');
      }
    }
  });
}
