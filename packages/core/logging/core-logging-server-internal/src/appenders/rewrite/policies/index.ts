/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { assertNever } from '@kbn/std';
import type { RewritePolicyConfig } from '@kbn/core-logging-server';
import { RewritePolicy } from './policy';
import { MetaRewritePolicy, metaRewritePolicyConfigSchema } from './meta';

export type { RewritePolicy };

export const rewritePolicyConfigSchema = metaRewritePolicyConfigSchema;

export const createRewritePolicy = (config: RewritePolicyConfig): RewritePolicy => {
  switch (config.type) {
    case 'meta':
      return new MetaRewritePolicy(config);
    default:
      return assertNever(config.type);
  }
};
