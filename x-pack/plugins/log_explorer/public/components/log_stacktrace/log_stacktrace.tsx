/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiEmptyPrompt, EuiLoadingSpinner, EuiSpacer, EuiText } from '@elastic/eui';
import { ElasticRequestState } from '@kbn/unified-doc-viewer';
import { useEsDocSearch } from '@kbn/unified-doc-viewer-plugin/public';
import { isEmpty } from 'lodash';
import { Stacktrace, ExceptionStacktrace, PlaintextStacktrace } from '@kbn/event-stacktrace';
import { FormattedMessage } from '@kbn/i18n-react';
import { ErrorRaw } from '@kbn/apm-es-schemas';
import { DocViewRenderProps } from '@kbn/unified-doc-viewer/types';
import { LogDocument } from '../../controller';
import './source.scss';
import {
  flyoutStacktraceErrorMessageTitle,
  flyoutStacktraceErrorMessage,
} from '../common/translations';

export function LogStacktrace({
  dataView,
  doc,
}: {
  dataView: DocViewRenderProps['dataView'];
  doc: LogDocument;
}) {
  const [errorDoc, setErrorDoc] = useState<ErrorRaw | undefined>();
  const [requestState, hit] = useEsDocSearch({
    id: doc.raw._id ?? doc.id,
    index: doc.raw._index,
    dataView,
    requestSource: true,
  });

  useEffect(() => {
    if (requestState === ElasticRequestState.Found && hit) {
      setErrorDoc(hit?.raw?._source as any as ErrorRaw);
    }
  }, [requestState, hit]);

  if (requestState === ElasticRequestState.Error || requestState === ElasticRequestState.NotFound) {
    return (
      <EuiEmptyPrompt
        iconType="warning"
        title={<h2>{flyoutStacktraceErrorMessageTitle}</h2>}
        body={
          <div>
            {flyoutStacktraceErrorMessage}
            <EuiSpacer size="s" />
            {/* <EuiButton iconType="refresh" onClick={() => {}}>
              {flyoutStacktraceErrorMessageTitle}
            </EuiButton> */}
          </div>
        }
      />
    );
  }

  if (requestState === ElasticRequestState.Loading || !errorDoc) {
    return (
      <div className="sourceViewer__loading">
        <EuiLoadingSpinner className="sourceViewer__loadingSpinner" />
        <EuiText size="xs" color="subdued">
          <FormattedMessage id="unifiedDocViewer.loadingJSON" defaultMessage="Loading JSON" />
        </EuiText>
      </div>
    );
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
          // message={errorDoc?.error.message}
          message={'test'}
          stacktrace={errorDoc?.error?.stack_trace}
        />
      );
    }
  } else {
    return <ExceptionStacktrace codeLanguage={codeLanguage} exceptions={exceptions} />;
  }
}
