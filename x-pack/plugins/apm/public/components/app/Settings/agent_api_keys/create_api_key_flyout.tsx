import React, { Fragment, useState, useRef } from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiButton,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyoutFooter,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  useGeneratedHtmlId,
  EuiFieldText,
  EuiCheckboxGroup,
  EuiText
} from '@elastic/eui';
import { callApmApi } from '../../../../services/rest/createCallApmApi';

export function CreateApiKeyFlyout() {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [checkboxIdToSelectedMap, setCheckboxIdToSelectedMap] = useState({});
  const indexInputRef = useRef<HTMLInputElement>(null as any);

  const showFlyout = () => setIsFlyoutVisible(true);
  const closeFlyout = () => setIsFlyoutVisible(false);

  const onChange = (optionId) => {
    const newCheckboxIdToSelectedMap = {
      ...checkboxIdToSelectedMap,
      ...{
        [optionId]: !checkboxIdToSelectedMap[optionId],
      },
    };
    setCheckboxIdToSelectedMap(newCheckboxIdToSelectedMap);
  };

  const createAPIkey = async ({
    sourcemap,
    event,
    agentConfig
  }: {
    sourcemap: boolean,
    event: boolean,
    agentConfig: boolean
  }) => {
    const name = indexInputRef.current.value;
    await callApmApi({
      endpoint: 'POST /apm/api_key',
      signal: null,
      params: {
        body: {
          name,
          sourcemap,
          event,
          agentConfig
        },
      },
    });
    closeFlyout();
  };

  const formRowCheckboxItemId__1 = useGeneratedHtmlId({
    prefix: 'formRowCheckboxItem',
    suffix: 'first',
  });
  const formRowCheckboxItemId__2 = useGeneratedHtmlId({
    prefix: 'formRowCheckboxItem',
    suffix: 'second',
  });
  const formRowCheckboxItemId__3 = useGeneratedHtmlId({
    prefix: 'formRowCheckboxItem',
    suffix: 'third',
  });

  const checkboxes = [
    {
      id: formRowCheckboxItemId__1,
      label: 'Agent configuration',
    },
    {
      id: formRowCheckboxItemId__2,
      label: 'Ingest',
    },
    {
      id: formRowCheckboxItemId__3,
      label: 'Sourcemap',
    },
  ];

  const flyoutHeadingId = 'test';
  let flyout;

  if (isFlyoutVisible) {
    flyout = (
      <EuiFlyout
        onClose={closeFlyout}
        size="s"
      >
        <EuiFlyoutHeader hasBorder aria-labelledby={flyoutHeadingId}>
          <EuiTitle>
            <h2 id={flyoutHeadingId}>Create API key</h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody>
          <EuiForm component="form">
            <EuiFormRow label="User">
              <EuiText>Elastic</EuiText>
            </EuiFormRow>

            <EuiFormRow label="Name" helpText="What is this key used for?">
              <EuiFieldText name="name" inputRef={indexInputRef} />
            </EuiFormRow>

            <EuiSpacer />
            <EuiCheckboxGroup
              options={checkboxes}
              idToSelectedMap={checkboxIdToSelectedMap}
              onChange={(id) => onChange(id)}
              legend={{
                children:
                  'Assign privileges to the API key',
              }}
            />

            <EuiSpacer />
          </EuiForm>
        </EuiFlyoutBody>

        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty onClick={() => closeFlyout()}>
                Cancel
              </EuiButtonEmpty>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                onClick={() => {
                  createAPIkey({
                    sourcemap: true,
                    event: true,
                    agentConfig: true
                  })
                }}
                fill={true}
              >
                Create API key
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    )
  }

  return (
    <Fragment>
      <EuiButton
        onClick={showFlyout}
        fill={true}
        iconType='plusInCircleFilled'
      >
        {i18n.translate('xpack.apm.settings.agentKeys.createApiKeyButton', {
          defaultMessage: 'Create API key',
        })}
      </EuiButton>
      {flyout}
    </Fragment>
  );
}
