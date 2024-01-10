/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiEmptyPrompt, EuiEmptyPromptProps } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';

interface Props {
  heading?: string;
  subheading?: EuiEmptyPromptProps['body'];
  hideSubheading?: boolean;
}

function EmptyMessage({
  heading = i18n.translate('xpack.apm.emptyMessage.noDataFoundLabel', {
    defaultMessage: 'No data found.',
  }),
  subheading = i18n.translate('xpack.apm.emptyMessage.noDataFoundDescription', {
    defaultMessage: 'Try another time range or reset the search filter.',
  }),
  hideSubheading = false,
}: Props) {
  return (
    <EuiEmptyPrompt
      titleSize="s"
      title={<div>{heading}</div>}
      body={!hideSubheading && subheading}
    />
  );
}

export { EmptyMessage };
