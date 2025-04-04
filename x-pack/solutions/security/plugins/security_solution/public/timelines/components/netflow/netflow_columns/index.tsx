/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import React from 'react';
import styled from 'styled-components';

import { SourceDestination } from '../../../../explore/network/components/source_destination';

import { DurationEventStartEnd } from './duration_event_start_end';
import type { NetflowColumnsProps } from './types';
import { UserProcess } from './user_process';

const EuiFlexItemMarginRight = styled(EuiFlexItem)`
  margin-right: 10px;
`;

EuiFlexItemMarginRight.displayName = 'EuiFlexItemMarginRight';

/**
 * Renders columns of draggable badges that describe both Netflow data, or more
 * generally, hosts interacting over a network connection. This component is
 * consumed by the `Netflow` visualization / row renderer.
 *
 * This component will allow columns to wrap if constraints on width prevent all
 * the columns from fitting on a single horizontal row
 */
export const NetflowColumns = React.memo<NetflowColumnsProps>(
  ({
    contextId,
    scopeId,
    destinationBytes,
    destinationGeoContinentName,
    destinationGeoCountryName,
    destinationGeoCountryIsoCode,
    destinationGeoRegionName,
    destinationGeoCityName,
    destinationIp,
    destinationPackets,
    destinationPort,
    eventDuration,
    eventId,
    eventEnd,
    eventStart,
    networkBytes,
    networkCommunityId,
    networkDirection,
    networkPackets,
    networkProtocol,
    processName,
    sourceBytes,
    sourceGeoContinentName,
    sourceGeoCountryName,
    sourceGeoCountryIsoCode,
    sourceGeoRegionName,
    sourceGeoCityName,
    sourceIp,
    sourcePackets,
    sourcePort,
    transport,
    userName,
  }) => (
    <EuiFlexGroup
      data-test-subj="netflow-columns"
      gutterSize="none"
      justifyContent="center"
      wrap={true}
    >
      <EuiFlexItemMarginRight grow={false}>
        <UserProcess
          scopeId={scopeId}
          contextId={contextId}
          eventId={eventId}
          processName={processName}
          userName={userName}
        />
      </EuiFlexItemMarginRight>

      <EuiFlexItemMarginRight grow={false}>
        <DurationEventStartEnd
          scopeId={scopeId}
          contextId={contextId}
          eventDuration={eventDuration}
          eventId={eventId}
          eventEnd={eventEnd}
          eventStart={eventStart}
        />
      </EuiFlexItemMarginRight>

      <EuiFlexItem grow={false}>
        <SourceDestination
          scopeId={scopeId}
          contextId={contextId}
          destinationBytes={destinationBytes}
          destinationGeoContinentName={destinationGeoContinentName}
          destinationGeoCountryName={destinationGeoCountryName}
          destinationGeoCountryIsoCode={destinationGeoCountryIsoCode}
          destinationGeoRegionName={destinationGeoRegionName}
          destinationGeoCityName={destinationGeoCityName}
          destinationIp={destinationIp}
          destinationPackets={destinationPackets}
          destinationPort={destinationPort}
          eventId={eventId}
          networkBytes={networkBytes}
          networkCommunityId={networkCommunityId}
          networkDirection={networkDirection}
          networkPackets={networkPackets}
          networkProtocol={networkProtocol}
          sourceBytes={sourceBytes}
          sourceGeoContinentName={sourceGeoContinentName}
          sourceGeoCountryName={sourceGeoCountryName}
          sourceGeoCountryIsoCode={sourceGeoCountryIsoCode}
          sourceGeoRegionName={sourceGeoRegionName}
          sourceGeoCityName={sourceGeoCityName}
          sourceIp={sourceIp}
          sourcePackets={sourcePackets}
          sourcePort={sourcePort}
          transport={transport}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  )
);

NetflowColumns.displayName = 'NetflowColumns';
