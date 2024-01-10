/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  EuiButton,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { DocViewRenderProps } from '@kbn/unified-doc-viewer/types';
import { ElasticRequestState } from '@kbn/unified-doc-viewer';
import { useEsDocSearch } from '@kbn/unified-doc-viewer-plugin/public';
import { isEmpty } from 'lodash';
import {
  Stacktrace,
  ExceptionStacktrace,
  PlaintextStacktrace,
  ApmLogsExplorerError,
} from '@kbn/apm-error-stacktrace';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { LogExplorerFlyoutContentProps } from '../components/flyout_detail';
import { LogDocument, useLogExplorerControllerContext } from '../controller';

export const CustomFlyoutException = ({
  filter,
  onAddColumn,
  onRemoveColumn,
  dataView,
  hit,
}: DocViewRenderProps) => {
  const {
    customizations: { flyout },
  } = useLogExplorerControllerContext();

  const flyoutContentProps: LogExplorerFlyoutContentProps = useMemo(
    () => ({
      actions: {
        addFilter: filter,
        addColumn: onAddColumn,
        removeColumn: onRemoveColumn,
      },
      dataView,
      doc: hit as LogDocument,
    }),
    [filter, onAddColumn, onRemoveColumn, dataView, hit]
  );

  const renderCustomizedContent = useMemo(
    () => flyout?.renderContent?.(renderContent) ?? renderContent,
    [flyout]
  );

  return (
    <>
      <EuiSpacer size="m" />
      <EuiFlexGroup direction="column">
        {/* Apply custom Log Explorer detail */}
        {renderCustomizedContent(flyoutContentProps)}
      </EuiFlexGroup>
    </>
  );
};

const renderContent = ({ actions, dataView, doc }: LogExplorerFlyoutContentProps) => (
  <EuiFlexItem>
    <ExceptionNew dataView={dataView} doc={doc} />
  </EuiFlexItem>
);

// eslint-disable-next-line import/no-default-export
export default CustomFlyoutException;

export function ExceptionNew({
  dataView,
  doc,
}: {
  dataView: DocViewRenderProps['dataView'];
  doc: LogDocument;
}) {
  const [errorDoc, setErrorDoc] = useState<ApmLogsExplorerError | undefined>();
  const [requestState, hit] = useEsDocSearch({
    id: doc.raw._id ?? doc.id,
    index: doc.raw._index,
    dataView,
    requestSource: true,
  });

  useEffect(() => {
    if (requestState === ElasticRequestState.Found && hit) {
      setErrorDoc(hit?.raw?._source);
    }
  }, [requestState, hit]);

  const loadingState = (
    <div className="sourceViewer__loading">
      <EuiLoadingSpinner className="sourceViewer__loadingSpinner" />
      <EuiText size="xs" color="subdued">
        <FormattedMessage id="unifiedDocViewer.loadingJSON" defaultMessage="Loading JSON" />
      </EuiText>
    </div>
  );

  const errorMessageTitle = (
    <h2>
      {i18n.translate('unifiedDocViewer.sourceViewer.errorMessageTitle', {
        defaultMessage: 'An Error Occurred',
      })}
    </h2>
  );
  const errorMessage = (
    <div>
      {i18n.translate('unifiedDocViewer.sourceViewer.errorMessage', {
        defaultMessage: 'Could not fetch data at this time. Refresh the tab to try again.',
      })}
      <EuiSpacer size="s" />
      <EuiButton iconType="refresh" onClick={() => {}}>
        {i18n.translate('unifiedDocViewer.sourceViewer.refresh', {
          defaultMessage: 'Refresh',
        })}
      </EuiButton>
    </div>
  );
  const errorState = (
    <EuiEmptyPrompt iconType="warning" title={errorMessageTitle} body={errorMessage} />
  );

  if (requestState === ElasticRequestState.Error || requestState === ElasticRequestState.NotFound) {
    return errorState;
  }

  if (requestState === ElasticRequestState.Loading || !errorDoc) {
    return loadingState;
  }

  const codeLanguage = errorDoc?.service?.language?.name;
  const exceptions = errorDoc?.error.exception || [];
  const logStackframes = errorDoc?.error.log?.stacktrace;
  const isPlaintextException =
    !!errorDoc?.error.stack_trace && exceptions.length === 1 && !exceptions[0].stacktrace;

  // Todo: modified this for other integrations
  const hasErrorStackTrace = !!errorDoc?.error.stack_trace;

  const hasLogStacktrace = !isEmpty(errorDoc?.error?.log?.stacktrace);

  if (hasLogStacktrace) {
    return <Stacktrace stackframes={logStackframes} codeLanguage={codeLanguage} />;
  }

  if (hasErrorStackTrace) {
    if (isPlaintextException) {
      return (
        <PlaintextStacktrace
          message={exceptions[0].message}
          type={exceptions[0].type}
          stacktrace={errorDoc?.error?.stack_trace}
          codeLanguage={codeLanguage}
        />
      );
    } else {
      // Todo: other integrations
      return (
        <PlaintextStacktrace
          message={errorDoc?.error.message}
          stacktrace={errorDoc?.error?.stack_trace}
        />
      );
    }
  } else {
    return <ExceptionStacktrace codeLanguage={codeLanguage} exceptions={exceptions} />;
  }
}
