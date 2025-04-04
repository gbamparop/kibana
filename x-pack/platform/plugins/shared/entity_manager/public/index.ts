/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { PluginInitializer, PluginInitializerContext } from '@kbn/core/public';
import { Plugin } from './plugin';
import { EntityManagerPublicPluginSetup, EntityManagerPublicPluginStart } from './types';

export const plugin: PluginInitializer<
  EntityManagerPublicPluginSetup | undefined,
  EntityManagerPublicPluginStart | undefined
> = (context: PluginInitializerContext) => {
  return new Plugin(context);
};

export { EntityClient } from './lib/entity_client';

export type { EntityManagerPublicPluginSetup, EntityManagerPublicPluginStart };
export type EntityManagerAppId = 'entityManager';

export {
  ERROR_API_KEY_NOT_FOUND,
  ERROR_API_KEY_NOT_VALID,
  ERROR_API_KEY_SERVICE_DISABLED,
  ERROR_PARTIAL_BUILTIN_INSTALLATION,
  ERROR_DEFINITION_STOPPED,
} from '../common/errors';

export { EntityManagerUnauthorizedError } from './lib/errors';
