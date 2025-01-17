/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiBetaBadge,
  EuiHeader,
  EuiHeaderLinks,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  useEuiTheme,
} from '@elastic/eui';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { HeaderMenuPortal } from '@kbn/observability-shared-plugin/public';
import { toMountPoint } from '@kbn/react-kibana-mount';
import React, { useEffect, useState } from 'react';
import useObservable from 'react-use/lib/useObservable';
import { filter, take } from 'rxjs';
import {
  deprecationBadgeDescription,
  deprecationBadgeGuideline,
  deprecationBadgeTitle,
} from '../../common/translations';
import { useKibanaContextForPlugin } from '../utils/use_kibana';
import { ConnectedDiscoverLink } from './discover_link';
import { FeedbackLink } from './feedback_link';
import { ConnectedOnboardingLink } from './onboarding_link';
import { AlertsPopover } from './alerts_popover';
import { ConnectedDatasetQualityLink } from './dataset_quality_link';

export const LogsExplorerTopNavMenu = () => {
  const {
    services: { chrome },
  } = useKibanaContextForPlugin();

  const chromeStyle = useObservable(chrome.getChromeStyle$());

  return chromeStyle === 'project' ? <ProjectTopNav /> : <ClassicTopNav />;
};

const ProjectTopNav = () => {
  const { euiTheme } = useEuiTheme();

  return (
    <EuiHeader
      data-test-subj="logsExplorerHeaderMenu"
      css={{ boxShadow: 'none', backgroundColor: euiTheme.colors.backgroundBasePlain }}
    >
      <EuiHeaderSection
        side="right"
        css={css`
          gap: ${euiTheme.size.m};
        `}
      >
        <EuiHeaderSectionItem>
          <DeprecationNoticeBadge />
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem>
          <EuiHeaderLinks gutterSize="xs">
            <ConnectedDiscoverLink />
            <ConditionalVerticalRule Component={ConnectedDatasetQualityLink()} />
            <VerticalRule />
            <FeedbackLink />
            <VerticalRule />
            <AlertsPopover />
            <VerticalRule />
          </EuiHeaderLinks>
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem>
          <ConnectedOnboardingLink />
        </EuiHeaderSectionItem>
      </EuiHeaderSection>
    </EuiHeader>
  );
};

const ClassicTopNav = () => {
  const { euiTheme } = useEuiTheme();
  const {
    services: {
      appParams: { setHeaderActionMenu },
      chrome,
      i18n: i18nStart,
      theme,
    },
  } = useKibanaContextForPlugin();
  /**
   * Since the breadcrumbsAppendExtension might be set only during a plugin start (e.g. search session)
   * we retrieve the latest valid extension in order to restore it once we unmount the beta badge.
   */
  const [previousAppendExtension$] = useState(() =>
    chrome.getBreadcrumbsAppendExtension$().pipe(filter(Boolean), take(1))
  );

  const previousAppendExtension = useObservable(previousAppendExtension$);

  useEffect(() => {
    if (chrome) {
      chrome.setBreadcrumbsAppendExtension({
        content: toMountPoint(
          <EuiHeaderSection
            data-test-subj="logsExplorerHeaderMenu"
            css={css`
              margin-left: ${euiTheme.size.m};
            `}
          >
            <EuiHeaderSectionItem>
              <FeedbackLink />
            </EuiHeaderSectionItem>
          </EuiHeaderSection>,
          { theme, i18n: i18nStart }
        ),
      });
    }

    return () => {
      if (chrome) {
        chrome.setBreadcrumbsAppendExtension(previousAppendExtension);
      }
    };
  }, [chrome, i18nStart, previousAppendExtension, theme, euiTheme]);

  return (
    <HeaderMenuPortal setHeaderActionMenu={setHeaderActionMenu} theme$={theme.theme$}>
      <EuiHeaderSection data-test-subj="logsExplorerHeaderMenu">
        <EuiHeaderSectionItem>
          <EuiHeaderLinks gutterSize="xs">
            <EuiHeaderSectionItem>
              <DeprecationNoticeBadge />
            </EuiHeaderSectionItem>
            <ConnectedDiscoverLink />
            <ConditionalVerticalRule Component={ConnectedDatasetQualityLink()} />
            <VerticalRule />
            <AlertsPopover />
            <VerticalRule />
            <ConnectedOnboardingLink />
          </EuiHeaderLinks>
        </EuiHeaderSectionItem>
      </EuiHeaderSection>
    </HeaderMenuPortal>
  );
};

const VerticalRule = styled.span`
  width: ${(props) => props.theme.euiTheme.border.width.thin};
  height: 20px;
  background-color: ${(props) => props.theme.euiTheme.colors.borderBaseSubdued};
`;

const ConditionalVerticalRule = ({ Component }: { Component: JSX.Element | null }) =>
  Component && (
    <>
      <VerticalRule />
      {Component}
    </>
  );

const DeprecationNoticeBadge = () => (
  <EuiBetaBadge
    label={deprecationBadgeTitle}
    color="subdued"
    tooltipContent={
      <>
        {deprecationBadgeDescription}
        <br />
        <br />
        {deprecationBadgeGuideline}
      </>
    }
    alignment="middle"
  />
);
