/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiInMemoryTable,
  EuiText,
  EuiSpacer,
  EuiBasicTableColumn,
  EuiInMemoryTableProps,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiEmptyPrompt,
  EuiButton
} from '@elastic/eui';
import { useFetcher, FETCH_STATUS } from '../../../../hooks/use_fetcher';
import { ApiKey } from '../../../../../../security/common/model';
import { TimestampTooltip } from '../../../shared/TimestampTooltip';
import { CreateApiKeyFlyout } from './create_api_key_flyout';
import { ApiKeysNotEnabled } from './api_keys_not_enabled';

export function AgentApiKeys() {
  const { data, status } = useFetcher((callApmApi) => {
    return callApmApi({
      endpoint: 'GET /apm/api_key',
    });
  }, []);

  const { data: privilegeData = {}, status: privilegeStatus } = useFetcher((callApmApi) => {
    return callApmApi({
      endpoint: 'GET /apm/api_key/privileges',
    });
  }, [], { showToastOnError: false });

  const { areApiKeysEnabled, isAdmin, canManage } = privilegeData;

  if (privilegeStatus === FETCH_STATUS.SUCCESS && areApiKeysEnabled && canManage) {

  } else if (privilegeStatus === FETCH_STATUS.FAILURE) {
    return (
      <EuiEmptyPrompt
        iconType="alert"
        color="subdued"
        title={
          <h2>
            {i18n.translate('xpack.apm.settings.agentKeys.fetchingPrivilegesErrorMessage', {
              defaultMessage: 'Error checking privileges'
            })}
          </h2>}
      />
    )
  }

  const apiKeys = data?.apiKeys || [];

  const emptyStatePrompt = (
    <EuiEmptyPrompt
      iconType="gear"
      title={
        <h2>
          {i18n.translate('xpack.apm.settings.agentKeys.emptyPromptTitle', {
            defaultMessage: 'Create your first agent key',
          })}
        </h2>
      }
      body={
        <p>
          {i18n.translate('xpack.apm.settings.agentKeys.emptyPromptBody', {
            defaultMessage: 'Create agent keys to authorize requests to the APM Server.',
          })}
        </p>
      }
      actions={
        <EuiButton
          fill={true}
          iconType='plusInCircleFilled'
        >
          {i18n.translate('xpack.apm.settings.agentKeys.createAgentKeyButton', {
            defaultMessage: 'Create agent key',
          })}
        </EuiButton>
      }
    />
  );

  const failurePrompt = (
    <EuiEmptyPrompt
      iconType="alert"
      color="subdued"
      title={
        <h2>
          {i18n.translate('xpack.apm.settings.agentKeys.table.errorMessage', {
            defaultMessage: 'Could not load API keys.'
          })}
        </h2>}
    />
  );

  return (
    <Fragment>
      <EuiText color="subdued">
        {i18n.translate('xpack.apm.settings.agentKeys.descriptionText', {
          defaultMessage:
            'View and delete API keys. An API key sends requests on behalf of a user.',
        })}
      </EuiText>
      <EuiSpacer size="m" />
      <EuiFlexGroup justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiTitle>
            <h2>
              {i18n.translate('xpack.apm.settings.agentKeys.title', {
                defaultMessage: 'Agent keys',
              })}
            </h2>
          </EuiTitle>
        </EuiFlexItem>
        {status === FETCH_STATUS.SUCCESS && areApiKeysEnabled && canManage && (
          <EuiFlexItem grow={false}>
            <CreateApiKeyFlyout />
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      <EuiSpacer size="m" />
      {!areApiKeysEnabled && <ApiKeysNotEnabled />}
      {status === FETCH_STATUS.FAILURE && failurePrompt}
      {status === FETCH_STATUS.SUCCESS && areApiKeysEnabled && canManage && apiKeys.length === 0 && emptyStatePrompt}
      {status === FETCH_STATUS.SUCCESS && areApiKeysEnabled && canManage && apiKeys.length === 0 && (
        <ApiKeysTable
          apiKeys={apiKeys}
        />
      )}
    </Fragment>
  );
}

function ApiKeysTable({
  apiKeys,
  loading,
  error,
}: {
  apiKeys: ApiKey[],
  loading: boolean,
  error: boolean,
}) {
  const columns: Array<EuiBasicTableColumn<ApiKey>> = [
    {
      field: 'name',
      name: i18n.translate('xpack.apm.settings.agentKeys.table.nameColumnName', {
        defaultMessage: 'Name',
      }),
      sortable: true,
    },
    {
      field: 'username',
      name: i18n.translate('xpack.apm.settings.agentKeys.table.userNameColumnName', {
        defaultMessage: 'User',
      }),
      sortable: true,
    },
    {
      field: 'realm',
      name: i18n.translate('xpack.apm.settings.agentKeys.table.realmColumnName', {
        defaultMessage: 'Realm',
      }),
      sortable: true,
    },
    {
      field: 'creation',
      name: i18n.translate('xpack.apm.settings.agentKeys.table.creationColumnName', {
        defaultMessage: 'Created',
      }),
      dataType: 'date',
      sortable: true,
      mobileOptions: {
        show: false,
      },
      render: (date: number) => <TimestampTooltip time={date} />,
    },
  ];

  const search: EuiInMemoryTableProps<ApiKey>['search'] = {
    box: {
      incremental: true,
    },
    filters: [
      {
        type: 'field_value_selection',
        field: 'username',
        name: i18n.translate('xpack.apm.settings.agentKeys.table.userFilterLabel', {
          defaultMessage: 'User',
        }),
        multiSelect: 'or',
        operator: 'exact',
        options: Object.keys(
          apiKeys.reduce((acc: Record<string, boolean>, { username }) => {
            acc[username] = true;
            return acc;
          }, {})
        ).map(value => ({ value }))
      },
      {
        type: 'field_value_selection',
        field: 'realm',
        name: i18n.translate('xpack.apm.settings.agentKeys.table.realmFilterLabel', {
          defaultMessage: 'Realm',
        }),
        multiSelect: 'or',
        operator: 'exact',
        options: Object.keys(
          apiKeys.reduce((acc: Record<string, boolean>, { realm }) => {
            acc[realm] = true;
            return acc;
          }, {})
        ).map(value => ({ value }))
      },
    ],
  };

  return (
    <EuiInMemoryTable
      tableCaption={i18n.translate('xpack.apm.settings.agentKeys.tableCaption', {
        defaultMessage: 'Agent API keys',
      })}
      items={apiKeys}
      columns={columns}
      pagination={true}
      search={search}
      sorting={true}
      error={
        error ? i18n.translate('xpack.apm.settings.agentKeys.table.errorMessage', {
          defaultMessage: 'Could not load API keys.'
        }) : ''
      }
      loading={loading}
    />
  );
}
