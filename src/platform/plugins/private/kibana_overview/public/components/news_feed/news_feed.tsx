/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { FC } from 'react';
import { EuiLink, EuiSpacer, EuiText, EuiTitle, UseEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import { FormattedMessage } from '@kbn/i18n-react';
import { FetchResult } from '@kbn/newsfeed-plugin/public';

interface Props {
  newsFetchResult: FetchResult | null | void;
}
const styles = ({ euiTheme }: UseEuiTheme) =>
  css({
    article: {
      '& + article': {
        marginTop: euiTheme.size.l,
      },
      '&, header': {
        '& > * + *': {
          marginTop: euiTheme.size.xs,
        },
      },
      h3: {
        fontWeight: 'inherit',
      },
    },
  });

export const NewsFeed: FC<Props> = ({ newsFetchResult }) => (
  <section aria-labelledby="kbnOverviewNews__title">
    <EuiTitle size="s">
      <h2 id="kbnOverviewNews__title">
        <FormattedMessage id="kibanaOverview.news.title" defaultMessage="What's new" />
      </h2>
    </EuiTitle>

    <EuiSpacer size="m" />
    <div css={styles}>
      {newsFetchResult?.feedItems
        .slice(0, 3)
        .map(({ title, description, linkUrl, publishOn }, index) => (
          <article key={title} aria-labelledby={`kbnOverviewNews__title${index}`}>
            <header>
              <EuiTitle size="xxs">
                <h3 id={`kbnOverviewNews__title${index}`}>
                  <EuiLink href={linkUrl} target="_blank">
                    {title}
                  </EuiLink>
                </h3>
              </EuiTitle>

              <EuiText size="xs" color="subdued">
                <p>
                  <time dateTime={publishOn.format('YYYY-MM-DD')}>
                    {publishOn.format('DD MMMM YYYY')}
                  </time>
                </p>
              </EuiText>
            </header>

            <EuiText size="xs">
              <p>{description}</p>
            </EuiText>
          </article>
        ))}
    </div>
  </section>
);
