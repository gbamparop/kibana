/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import {
  EuiFlexGroup,
  EuiFlexGroupProps,
  EuiFlexItem,
  EuiSpacer,
} from '@elastic/eui';
import React from 'react';
import { LazyControlGroupRenderer } from '@kbn/controls-plugin/public';
import { ViewMode } from '@kbn/embeddable-plugin/public';
import { withSuspense } from '@kbn/shared-ux-utility';
import { EuiLoadingSpinner } from '@elastic/eui';
import { getPhraseFilterValue } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { i18n } from '@kbn/i18n';
import { isMobileAgentName } from '../../../common/agent_name';
import { useApmServiceContext } from '../../context/apm_service/use_apm_service_context';
import { useBreakpoints } from '../../hooks/use_breakpoints';
import { ApmDatePicker } from './date_picker/apm_date_picker';
import { KueryBar } from './kuery_bar';
import { TimeComparison } from './time_comparison';
import { TransactionTypeSelect } from './transaction_type_select';
import { APM_STATIC_DATA_VIEW_ID } from '../../../common/data_view_constants';
import * as urlHelpers from './links/url_helpers';
import { TRANSACTION_TYPE } from '../../../common/es_fields/apm';

interface Props {
  hidden?: boolean;
  showKueryBar?: boolean;
  showTimeComparison?: boolean;
  showTransactionTypeSelector?: boolean;
  kueryBarPlaceholder?: string;
  kueryBarBoolFilter?: QueryDslQueryContainer[];
}

const ControlGroupRenderer = withSuspense(
  LazyControlGroupRenderer,
  <EuiLoadingSpinner />
);

export function SearchBar({
  hidden = false,
  showKueryBar = true,
  showTimeComparison = false,
  showTransactionTypeSelector = false,
  kueryBarBoolFilter,
  kueryBarPlaceholder,
}: Props) {
  const { agentName } = useApmServiceContext();
  const isMobileAgent = isMobileAgentName(agentName);

  const { isSmall, isMedium, isLarge, isXl, isXXL, isXXXL } = useBreakpoints();
  const history = useHistory();

  if (hidden) {
    return null;
  }

  const searchBarDirection: EuiFlexGroupProps['direction'] =
    isXXXL || (!isXl && !showTimeComparison) ? 'row' : 'column';

  return (
    <>
      <EuiFlexGroup
        gutterSize="s"
        responsive={false}
        direction={searchBarDirection}
      >
        <EuiFlexItem>
          <EuiFlexGroup
            direction={isLarge ? 'columnReverse' : 'row'}
            gutterSize="s"
            responsive={false}
          >
            {showTransactionTypeSelector && (
              <EuiFlexItem grow={false}>
                <TransactionTypeSelect />
                <ControlGroupRenderer
                  getInitialInput={async (initialInput, builder) => {
                    await builder.addDataControlFromField(initialInput, {
                      dataViewId: APM_STATIC_DATA_VIEW_ID,
                      title: i18n.translate(
                        'xpack.apm.control.transactionType',
                        {
                          defaultMessage: 'Transaction type',
                        }
                      ),
                      fieldName: TRANSACTION_TYPE,
                      width: 'medium',
                      grow: true,
                    });
                    return {
                      ...initialInput,
                      viewMode: ViewMode.VIEW,
                    };
                  }}
                  onLoadComplete={(controlGroup) => {
                    controlGroup.onFiltersPublished$.subscribe({
                      next: (result) => {
                        const value = getPhraseFilterValue(result[0]);
                        urlHelpers.push(history, {
                          query: { transactionType: value },
                        });
                      },
                    });
                  }}
                />
              </EuiFlexItem>
            )}

            {showKueryBar && (
              <EuiFlexItem>
                <KueryBar
                  placeholder={kueryBarPlaceholder}
                  boolFilter={kueryBarBoolFilter}
                />
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem grow={showTimeComparison && !isXXXL}>
          <EuiFlexGroup
            direction={isSmall || isMedium || isLarge ? 'columnReverse' : 'row'}
            justifyContent={isXXL ? 'flexEnd' : undefined}
            gutterSize="s"
            responsive={false}
          >
            {showTimeComparison && (
              <EuiFlexItem grow={isXXXL} style={{ minWidth: 300 }}>
                <TimeComparison />
              </EuiFlexItem>
            )}
            <EuiFlexItem grow={false}>
              <ApmDatePicker />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size={isMobileAgent ? 's' : 'm'} />
    </>
  );
}
