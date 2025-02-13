/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';

import type { LogEntryCategoryHistogram } from '../../../../../../common/log_analysis';
import type { TimeRange } from '../../../../../../common/time';
import { SingleMetricComparison } from './single_metric_comparison';
import { SingleMetricSparkline } from './single_metric_sparkline';

export const LogEntryCountSparkline: React.FunctionComponent<{
  currentCount: number;
  histograms: LogEntryCategoryHistogram[];
  timeRange: TimeRange;
}> = ({ currentCount, histograms, timeRange }) => {
  const metric = useMemo(
    () =>
      histograms
        .find((histogram) => histogram.histogramId === 'history')
        ?.buckets?.map(({ startTime: timestamp, logEntryCount: value }) => ({
          timestamp,
          value,
        })) ?? [],
    [histograms]
  );
  const referenceCount = useMemo(
    () =>
      histograms.find((histogram) => histogram.histogramId === 'reference')?.buckets?.[0]
        ?.logEntryCount ?? 0,
    [histograms]
  );

  const overallTimeRange = useMemo(
    () => ({
      endTime: timeRange.endTime,
      startTime: timeRange.startTime - (timeRange.endTime - timeRange.startTime),
    }),
    [timeRange.endTime, timeRange.startTime]
  );

  return (
    <>
      <SingleMetricSparkline metric={metric} timeRange={overallTimeRange} />
      <SingleMetricComparison previousValue={referenceCount} currentValue={currentCount} />
    </>
  );
};
