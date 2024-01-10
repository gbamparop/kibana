/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Stackframe } from './stackframe';

interface Log {
  message: string;
  stacktrace?: Stackframe[];
}

export interface Exception {
  attributes?: {
    response?: string;
  };
  code?: string;
  message?: string; // either message or type are given
  type?: string;
  module?: string;
  handled?: boolean;
  stacktrace?: Stackframe[];
}

export interface ApmLogsExplorerError {
  id: string;
  culprit?: string;
  grouping_key: string;
  // either exception or log are given
  exception?: Exception[];
  // page?: Page; // special property for RUM: shared by error and transaction
  log?: Log;
  stack_trace?: string;
  custom?: Record<string, unknown>;
}
