/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EuiTableSortingType } from '@elastic/eui';
import { Pagination } from '@elastic/eui';
import { InferenceAPIConfigResponse } from '@kbn/ml-trained-models-utils';
import { useMemo } from 'react';
import { ServiceProviderKeys } from '@kbn/inference-endpoint-ui-common';
import { InferenceInferenceEndpointInfo } from '@elastic/elasticsearch/lib/api/types';
import { DEFAULT_TABLE_LIMIT } from '../components/all_inference_endpoints/constants';
import {
  FilterOptions,
  INFERENCE_ENDPOINTS_TABLE_PER_PAGE_VALUES,
  QueryParams,
  SortOrder,
} from '../components/all_inference_endpoints/types';

interface UseTableDataReturn {
  tableData: InferenceInferenceEndpointInfo[];
  sortedTableData: InferenceInferenceEndpointInfo[];
  paginatedSortedTableData: InferenceInferenceEndpointInfo[];
  pagination: Pagination;
  sorting: EuiTableSortingType<InferenceInferenceEndpointInfo>;
}

export const useTableData = (
  inferenceEndpoints: InferenceAPIConfigResponse[],
  queryParams: QueryParams,
  filterOptions: FilterOptions,
  searchKey: string
): UseTableDataReturn => {
  const tableData: InferenceInferenceEndpointInfo[] = useMemo(() => {
    let filteredEndpoints = inferenceEndpoints;

    if (filterOptions.provider.length > 0) {
      filteredEndpoints = filteredEndpoints.filter((endpoint) =>
        filterOptions.provider.includes(ServiceProviderKeys[endpoint.service])
      );
    }

    if (filterOptions.type.length > 0) {
      filteredEndpoints = filteredEndpoints.filter((endpoint) =>
        filterOptions.type.includes(endpoint.task_type)
      );
    }

    return filteredEndpoints.filter((endpoint) => endpoint.inference_id.includes(searchKey));
  }, [inferenceEndpoints, searchKey, filterOptions]);

  const sortedTableData: InferenceInferenceEndpointInfo[] = useMemo(() => {
    return [...tableData].sort((a, b) => {
      const aValue = a[queryParams.sortField];
      const bValue = b[queryParams.sortField];

      if (queryParams.sortOrder === SortOrder.asc) {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [tableData, queryParams]);

  const pagination: Pagination = useMemo(
    () => ({
      pageIndex: queryParams.page - 1,
      pageSize: queryParams.perPage,
      pageSizeOptions: INFERENCE_ENDPOINTS_TABLE_PER_PAGE_VALUES,
      totalItemCount: inferenceEndpoints.length ?? 0,
    }),
    [inferenceEndpoints, queryParams]
  );

  const paginatedSortedTableData: InferenceInferenceEndpointInfo[] = useMemo(() => {
    const pageSize = pagination.pageSize || DEFAULT_TABLE_LIMIT;
    const startIndex = pagination.pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedTableData.slice(startIndex, endIndex);
  }, [sortedTableData, pagination]);

  const sorting = useMemo(
    () => ({
      sort: {
        direction: queryParams.sortOrder,
        field: queryParams.sortField,
      },
    }),
    [queryParams.sortField, queryParams.sortOrder]
  );

  return { tableData, sortedTableData, paginatedSortedTableData, pagination, sorting };
};
