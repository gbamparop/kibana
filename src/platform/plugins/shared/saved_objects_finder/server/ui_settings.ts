/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { schema } from '@kbn/config-schema';

import { UiSettingsParams } from '@kbn/core/server';
import { PER_PAGE_SETTING, LISTING_LIMIT_SETTING } from '../common';

export const uiSettings: Record<string, UiSettingsParams> = {
  [PER_PAGE_SETTING]: {
    name: i18n.translate('savedObjectsFinder.advancedSettings.perPageTitle', {
      defaultMessage: 'Objects per page',
    }),
    value: 20,
    type: 'number',
    description: i18n.translate('savedObjectsFinder.advancedSettings.perPageText', {
      defaultMessage: 'Number of objects to show per page in the load dialog',
    }),
    requiresPageReload: true,
    schema: schema.number(),
  },
  [LISTING_LIMIT_SETTING]: {
    name: i18n.translate('savedObjectsFinder.advancedSettings.listingLimitTitle', {
      defaultMessage: 'Objects listing limit',
    }),
    type: 'number',
    value: 1000,
    description: i18n.translate('savedObjectsFinder.advancedSettings.listingLimitText', {
      defaultMessage: 'Number of objects to fetch for the listing pages',
    }),
    schema: schema.number(),
  },
};
