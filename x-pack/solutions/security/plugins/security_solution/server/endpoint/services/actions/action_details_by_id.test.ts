/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ElasticsearchClientMock } from '@kbn/core/server/mocks';
import { elasticsearchServiceMock } from '@kbn/core/server/mocks';
import type { estypes } from '@elastic/elasticsearch';
import type {
  EndpointActionResponse,
  LogsEndpointAction,
  LogsEndpointActionResponse,
} from '../../../../common/endpoint/types';
import { EndpointActionGenerator } from '../../../../common/endpoint/data_generators/endpoint_action_generator';
import { getActionDetailsById } from '..';
import { NotFoundError } from '../../errors';
import {
  applyActionsEsSearchMock,
  createActionRequestsEsSearchResultsMock,
  createActionResponsesEsSearchResultsMock,
} from './mocks';
import { EndpointAppContextService } from '../../endpoint_app_context_services';
import {
  createMockEndpointAppContextServiceSetupContract,
  createMockEndpointAppContextServiceStartContract,
} from '../../mocks';

describe('When using `getActionDetailsById()', () => {
  let esClient: ElasticsearchClientMock;
  let endpointActionGenerator: EndpointActionGenerator;
  let actionRequests: estypes.SearchResponse<LogsEndpointAction>;
  let actionResponses: estypes.SearchResponse<EndpointActionResponse | LogsEndpointActionResponse>;
  let endpointAppContextService: EndpointAppContextService;

  beforeEach(() => {
    esClient = elasticsearchServiceMock.createScopedClusterClient().asInternalUser;
    endpointActionGenerator = new EndpointActionGenerator('seed');
    endpointAppContextService = new EndpointAppContextService();
    endpointAppContextService.setup(createMockEndpointAppContextServiceSetupContract());
    endpointAppContextService.start(createMockEndpointAppContextServiceStartContract());

    actionRequests = createActionRequestsEsSearchResultsMock();
    actionResponses = createActionResponsesEsSearchResultsMock();

    applyActionsEsSearchMock(esClient, actionRequests, actionResponses);
  });

  it('should return expected output', async () => {
    (endpointAppContextService.getEndpointMetadataService as jest.Mock) = jest
      .fn()
      .mockReturnValue({
        findHostMetadataForFleetAgents: jest.fn().mockResolvedValue([
          {
            agent: {
              id: 'agent-a',
            },
            host: {
              hostname: 'Host-agent-a',
            },
          },
        ]),
      });
    const doc = actionRequests.hits.hits[0]._source;
    await expect(
      getActionDetailsById(esClient, endpointAppContextService.getEndpointMetadataService(), '123')
    ).resolves.toEqual({
      action: '123',
      agents: ['agent-a'],
      agentType: 'endpoint',
      hosts: { 'agent-a': { name: 'Host-agent-a' } },
      command: 'running-processes',
      completedAt: '2022-04-30T16:08:47.449Z',
      wasSuccessful: true,
      errors: undefined,
      id: '123',
      isCompleted: true,
      isExpired: false,
      startedAt: '2022-04-27T16:08:47.449Z',
      comment: doc?.EndpointActions.data.comment,
      status: 'successful',
      createdBy: doc?.user.id,
      parameters: doc?.EndpointActions.data.parameters,
      outputs: {
        'agent-a': {
          content: {
            code: 'ra_execute_success_done',
            cwd: '/some/path',
            output_file_id: 'some-output-file-id',
            output_file_stderr_truncated: false,
            output_file_stdout_truncated: true,
            shell: 'bash',
            shell_code: 0,
            stderr: expect.any(String),
            stderr_truncated: true,
            stdout: expect.any(String),
            stdout_truncated: true,
          },
          type: 'json',
        },
      },
      agentState: {
        'agent-a': {
          completedAt: '2022-04-30T16:08:47.449Z',
          isCompleted: true,
          wasSuccessful: true,
          errors: undefined,
        },
      },
    });
  });

  it('should use expected filters when querying for Action Request', async () => {
    (endpointAppContextService.getEndpointMetadataService as jest.Mock) = jest
      .fn()
      .mockReturnValue({
        findHostMetadataForFleetAgents: jest.fn().mockResolvedValue([]),
      });
    await getActionDetailsById(
      esClient,
      endpointAppContextService.getEndpointMetadataService(),
      '123'
    );

    expect(esClient.search).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        query: {
          bool: {
            filter: [{ term: { action_id: '123' } }],
          },
        },
      }),
      expect.any(Object)
    );
  });

  it('should throw an error if action id does not exist', async () => {
    (endpointAppContextService.getEndpointMetadataService as jest.Mock) = jest
      .fn()
      .mockReturnValue({
        findHostMetadataForFleetAgents: jest.fn().mockResolvedValue([]),
      });
    actionRequests.hits.hits = [];
    (actionResponses.hits.total as estypes.SearchTotalHits).value = 0;
    actionRequests = endpointActionGenerator.toEsSearchResponse([]);

    await expect(
      getActionDetailsById(esClient, endpointAppContextService.getEndpointMetadataService(), '123')
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('should have `isExpired` of `true` if NOT complete and expiration is in the past', async () => {
    (endpointAppContextService.getEndpointMetadataService as jest.Mock) = jest
      .fn()
      .mockReturnValue({
        findHostMetadataForFleetAgents: jest.fn().mockResolvedValue([]),
      });
    (
      actionRequests.hits.hits[0]._source as LogsEndpointAction
    ).EndpointActions.expiration = `2021-04-30T16:08:47.449Z`;
    actionResponses.hits.hits.pop(); // remove the endpoint response

    await expect(
      getActionDetailsById(esClient, endpointAppContextService.getEndpointMetadataService(), '123')
    ).resolves.toEqual(
      expect.objectContaining({
        isExpired: true,
        isCompleted: false,
      })
    );
  });

  it('should have `isExpired` of `false` if complete and expiration is in the past', async () => {
    (endpointAppContextService.getEndpointMetadataService as jest.Mock) = jest
      .fn()
      .mockReturnValue({
        findHostMetadataForFleetAgents: jest.fn().mockResolvedValue([]),
      });
    (
      actionRequests.hits.hits[0]._source as LogsEndpointAction
    ).EndpointActions.expiration = `2021-04-30T16:08:47.449Z`;

    await expect(
      getActionDetailsById(esClient, endpointAppContextService.getEndpointMetadataService(), '123')
    ).resolves.toEqual(
      expect.objectContaining({
        isExpired: false,
        isCompleted: true,
      })
    );
  });
});
