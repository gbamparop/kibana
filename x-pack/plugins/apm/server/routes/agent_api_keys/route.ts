/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { createApmServerRoute } from '../apm_routes/create_apm_server_route';
import { createApmServerRouteRepository } from '../apm_routes/create_apm_server_route_repository';
import { getAgentApiKeys } from './get_agent_api_keys';
import { getApiPrivileges } from './get_api_privileges';
import Boom from '@hapi/boom';
import { i18n } from '@kbn/i18n';
import * as t from 'io-ts';
import { toBooleanRt } from '@kbn/io-ts-utils/to_boolean_rt';

const agentApiKeyRoute = createApmServerRoute({
  endpoint: 'GET /apm/api_key',
  options: { tags: ['access:apm'] },

  handler: async (resources) => {
    const { context } = resources;
    const apiKeys = await getAgentApiKeys({
      context,
    });
    // throw Boom.internal(SECURITY_REQUIRED_MESSAGE);

    return {
      apiKeys,
    };
  },
});

const agentApiKeyPrivilegesRoute = createApmServerRoute({
  endpoint: 'GET /apm/api_key/privileges',
  options: { tags: ['access:apm'] },

  handler: async (resources) => {
    const { plugins: { security }, context } = resources;
    throw Boom.internal(SECURITY_REQUIRED_MESSAGE);


    if (!security) {
      throw Boom.internal(SECURITY_REQUIRED_MESSAGE);
    }

    const securityPluginStart = await security.start();
    const apiPrivileges = await getApiPrivileges({
      context,
      securityPluginStart
    });

    return apiPrivileges;
  },
});

const createAgentApiKeyRoute = createApmServerRoute({
  endpoint: 'POST /apm/api_key',
  options: { tags: ['access:apm'] },
  params: t.type({
    body: t.intersection([
      t.partial({
        sourcemap: toBooleanRt,
        event: toBooleanRt,
        agentConfig: toBooleanRt,
      }),
      t.type({
        name: t.string,
      }),
    ]),
  }),
  handler: async (resources) => {
    const { plugins: { security }, request, params } = resources;

    if (!security) {
      throw Boom.internal(SECURITY_REQUIRED_MESSAGE);
    }

    const body = {
      name: params.body.name,
      metadata: {
        application: 'apm'
      },
      role_descriptors: {
        apm: {
          applications: [
            {
              application: 'apm',
              privileges: ['sourcemap:write', 'event:write', 'config_agent:read'],
              resources: ['*']
            }
          ]
        }
      }
    };

    const securityPluginStart = await security.start();
    const apiKey = await securityPluginStart.authc.apiKeys.create(request, body);

    // if (!apiKey) {
    //   return response.badRequest({ body: { message: `API Keys are not available` } });
    // }

    return apiKey;
  },
});

const invalidateAgentApiKeyRoute = createApmServerRoute({
  endpoint: 'POST /apm/api_key/invalidate',
  options: { tags: ['access:apm'] },
  params: t.type({
    body: t.type({ id: t.string, })
  }),
  handler: async (resources) => {
    const { plugins: { security }, request, params } = resources;

    if (!security) {
      throw Boom.internal(SECURITY_REQUIRED_MESSAGE);
    }

    const body = {
      name: params.body.name,
      metadata: {
        application: 'apm'
      },
      role_descriptors: {
        apm: {
          applications: [
            {
              application: 'apm',
              privileges: ['sourcemap:write', 'event:write', 'config_agent:read'],
              resources: ['*']
            }
          ]
        }
      }
    };

    const securityPluginStart = await security.start();
    const apiKey = await securityPluginStart.authc.apiKeys.create(request, body);

    // if (!apiKey) {
    //   return response.badRequest({ body: { message: `API Keys are not available` } });
    // }

    return apiKey;
  },
});

export const agentApiKeyRouteRepository =
  createApmServerRouteRepository()
    .add(agentApiKeyRoute)
    .add(agentApiKeyPrivilegesRoute)
    .add(createAgentApiKeyRoute);

const SECURITY_REQUIRED_MESSAGE = i18n.translate(
  'xpack.apm.api.apiKeys.securityRequired',
  { defaultMessage: 'Security plugin is required' }
);
