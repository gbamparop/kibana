/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { getDemoNetflowData } from '../../../../common/demo_data/netflow';
import { netflowRowRenderer } from '../../timeline/body/renderers/netflow/netflow_row_renderer';
import { ROW_RENDERER_BROWSER_EXAMPLE_TIMELINE_ID } from '../constants';

const NetflowExampleComponent: React.FC = () => (
  <>
    {netflowRowRenderer.renderRow({
      data: getDemoNetflowData(),
      scopeId: ROW_RENDERER_BROWSER_EXAMPLE_TIMELINE_ID,
    })}
  </>
);
export const NetflowExample = React.memo(NetflowExampleComponent);
