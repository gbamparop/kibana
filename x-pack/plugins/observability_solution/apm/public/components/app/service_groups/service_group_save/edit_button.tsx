/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EuiButton } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';

interface Props {
  onClick: () => void;
}

export function EditButton({ onClick }: Props) {
  return (
    <EuiButton
      data-test-subj="apmEditButtonEditGroupButton"
      iconType="pencil"
      onClick={() => {
        onClick();
      }}
    >
      {i18n.translate('xpack.apm.serviceGroups.editGroupLabel', {
        defaultMessage: 'Edit group',
      })}
    </EuiButton>
  );
}
