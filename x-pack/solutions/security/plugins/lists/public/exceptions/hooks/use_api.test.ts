/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import * as api from '@kbn/securitysolution-list-api';
import { useApi } from '@kbn/securitysolution-list-hooks';
import type {
  AddExceptionListItemProps,
  ApiCallByIdProps,
  ApiCallByListIdProps,
  DuplicateExceptionListProps,
  UpdateExceptionListItemProps,
} from '@kbn/securitysolution-io-ts-list-types';
import { coreMock } from '@kbn/core/public/mocks';

import { ENTRIES_WITH_IDS } from '../../../common/constants.mock';
import { getUpdateExceptionListItemSchemaMock } from '../../../common/schemas/request/update_exception_list_item_schema.mock';
import { getExceptionListSchemaMock } from '../../../common/schemas/response/exception_list_schema.mock';
import { getFoundExceptionListItemSchemaMock } from '../../../common/schemas/response/found_exception_list_item_schema.mock';
import { getExceptionListItemSchemaMock } from '../../../common/schemas/response/exception_list_item_schema.mock';
import { getCreateExceptionListItemSchemaMock } from '../../../common/schemas/request/create_exception_list_item_schema.mock';

jest.mock('@kbn/securitysolution-list-api');

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('123'),
}));

const mockKibanaHttpService = coreMock.createStart().http;

// TODO: Once the mocks are figured out and the types are moved into kbn core this test should be moved next to the file: x-pack/solutions/security/packages/kbn-securitysolution-list-hooks/src/use_api/index.test.ts

describe('useApi', () => {
  const onErrorMock = jest.fn();

  afterEach(() => {
    onErrorMock.mockClear();
    jest.clearAllMocks();
  });

  describe('deleteExceptionItem', () => {
    test('it invokes "deleteExceptionListItemById" when "deleteExceptionItem" used', async () => {
      const payload = getExceptionListItemSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnDeleteExceptionListItemById = jest
        .spyOn(api, 'deleteExceptionListItemById')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = payload;

      await act(async () => {
        await result.current.deleteExceptionItem({
          id,
          namespaceType,
          onError: jest.fn(),
          onSuccess: onSuccessMock,
        });
      });

      const expected: ApiCallByIdProps = {
        http: mockKibanaHttpService,
        id,
        namespaceType,
        signal: new AbortController().signal,
      };

      expect(spyOnDeleteExceptionListItemById).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalled();
    });

    test('invokes "onError" callback if "deleteExceptionListItemById" fails', async () => {
      const mockError = new Error('failed to delete item');
      jest.spyOn(api, 'deleteExceptionListItemById').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = getExceptionListItemSchemaMock();

      await act(async () => {
        await result.current.deleteExceptionItem({
          id,
          namespaceType,
          onError: onErrorMock,
          onSuccess: jest.fn(),
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('deleteExceptionList', () => {
    test('it invokes "deleteExceptionListById" when "deleteExceptionList" used', async () => {
      const payload = getExceptionListSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnDeleteExceptionListById = jest
        .spyOn(api, 'deleteExceptionListById')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = payload;

      await act(async () => {
        await result.current.deleteExceptionList({
          id,
          namespaceType,
          onError: jest.fn(),
          onSuccess: onSuccessMock,
        });
      });

      const expected: ApiCallByIdProps = {
        http: mockKibanaHttpService,
        id,
        namespaceType,
        signal: new AbortController().signal,
      };

      expect(spyOnDeleteExceptionListById).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalled();
    });

    test('invokes "onError" callback if "deleteExceptionListById" fails', async () => {
      const mockError = new Error('failed to delete item');
      jest.spyOn(api, 'deleteExceptionListById').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = getExceptionListSchemaMock();

      await act(async () => {
        await result.current.deleteExceptionList({
          id,
          namespaceType,
          onError: onErrorMock,
          onSuccess: jest.fn(),
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getExceptionItem', () => {
    test('it invokes "fetchExceptionListItemById" when "getExceptionItem" used', async () => {
      const payload = getExceptionListItemSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnFetchExceptionListItemById = jest
        .spyOn(api, 'fetchExceptionListItemById')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = payload;

      await act(async () => {
        await result.current.getExceptionItem({
          id,
          namespaceType,
          onError: jest.fn(),
          onSuccess: onSuccessMock,
        });
      });

      const expected: ApiCallByIdProps = {
        http: mockKibanaHttpService,
        id,
        namespaceType,
        signal: new AbortController().signal,
      };
      const expectedExceptionListItem = {
        ...getExceptionListItemSchemaMock(),
        entries: ENTRIES_WITH_IDS,
      };

      expect(spyOnFetchExceptionListItemById).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalledWith(expectedExceptionListItem);
    });

    test('invokes "onError" callback if "fetchExceptionListItemById" fails', async () => {
      const mockError = new Error('failed to delete item');
      jest.spyOn(api, 'fetchExceptionListItemById').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = getExceptionListSchemaMock();

      await act(async () => {
        await result.current.getExceptionItem({
          id,
          namespaceType,
          onError: onErrorMock,
          onSuccess: jest.fn(),
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getExceptionList', () => {
    test('it invokes "fetchExceptionListById" when "getExceptionList" used', async () => {
      const payload = getExceptionListSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnFetchExceptionListById = jest
        .spyOn(api, 'fetchExceptionListById')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = payload;

      await act(async () => {
        await result.current.getExceptionList({
          id,
          namespaceType,
          onError: jest.fn(),
          onSuccess: onSuccessMock,
        });
      });

      const expected: ApiCallByIdProps = {
        http: mockKibanaHttpService,
        id,
        namespaceType,
        signal: new AbortController().signal,
      };

      expect(spyOnFetchExceptionListById).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalled();
    });

    test('invokes "onError" callback if "fetchExceptionListById" fails', async () => {
      const mockError = new Error('failed to delete item');
      jest.spyOn(api, 'fetchExceptionListById').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      const { id, namespace_type: namespaceType } = getExceptionListSchemaMock();

      await act(async () => {
        await result.current.getExceptionList({
          id,
          namespaceType,
          onError: onErrorMock,
          onSuccess: jest.fn(),
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getExceptionListsItems', () => {
    test('it invokes "fetchExceptionListsItemsByListIds" when "getExceptionListsItems" used', async () => {
      const output = getFoundExceptionListItemSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnFetchExceptionListsItemsByListIds = jest
        .spyOn(api, 'fetchExceptionListsItemsByListIds')
        .mockResolvedValue(output);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.getExceptionListsItems({
          lists: [
            { id: 'myListId', listId: 'list_id', namespaceType: 'single', type: 'detection' },
          ],
          onError: jest.fn(),
          onSuccess: onSuccessMock,
          pagination: {
            page: 1,
            perPage: 1,
            total: 0,
          },
          showDetectionsListsOnly: false,
          showEndpointListsOnly: false,
        });
      });

      const expected: ApiCallByListIdProps = {
        http: mockKibanaHttpService,
        listIds: ['list_id'],
        namespaceTypes: ['single'],
        pagination: {
          page: 1,
          perPage: 1,
          total: 0,
        },
        signal: new AbortController().signal,
      };

      expect(spyOnFetchExceptionListsItemsByListIds).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalledWith({
        exceptions: [{ ...getExceptionListItemSchemaMock(), entries: ENTRIES_WITH_IDS }],
        pagination: {
          page: 1,
          perPage: 1,
          total: 1,
        },
      });
    });

    test('it does not invoke "fetchExceptionListsItemsByListIds" if no listIds', async () => {
      const output = getFoundExceptionListItemSchemaMock();
      const onSuccessMock = jest.fn();
      const spyOnFetchExceptionListsItemsByListIds = jest
        .spyOn(api, 'fetchExceptionListsItemsByListIds')
        .mockResolvedValue(output);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.getExceptionListsItems({
          lists: [
            { id: 'myListId', listId: 'list_id', namespaceType: 'single', type: 'detection' },
          ],
          onError: jest.fn(),
          onSuccess: onSuccessMock,
          pagination: {
            page: 1,
            perPage: 20,
            total: 0,
          },
          showDetectionsListsOnly: false,
          showEndpointListsOnly: true,
        });
      });

      expect(spyOnFetchExceptionListsItemsByListIds).not.toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalledWith({
        exceptions: [],
        pagination: {
          page: 0,
          perPage: 20,
          total: 0,
        },
      });
    });

    test('invokes "onError" callback if "fetchExceptionListsItemsByListIds" fails', async () => {
      const mockError = new Error('failed to delete item');
      jest.spyOn(api, 'fetchExceptionListsItemsByListIds').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.getExceptionListsItems({
          lists: [
            { id: 'myListId', listId: 'list_id', namespaceType: 'single', type: 'detection' },
          ],
          onError: onErrorMock,
          onSuccess: jest.fn(),
          pagination: {
            page: 1,
            perPage: 20,
            total: 0,
          },
          showDetectionsListsOnly: false,
          showEndpointListsOnly: false,
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });

  describe('addExceptionListItem', () => {
    test('it removes exception item entry ids', async () => {
      const payload = getExceptionListItemSchemaMock();
      const itemToCreate = { ...getCreateExceptionListItemSchemaMock(), entries: ENTRIES_WITH_IDS };
      const spyOnFetchExceptionListItemById = jest
        .spyOn(api, 'addExceptionListItem')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.addExceptionListItem({
          listItem: itemToCreate,
        });
      });

      const expected: AddExceptionListItemProps = {
        http: mockKibanaHttpService,
        listItem: getCreateExceptionListItemSchemaMock(),
        signal: new AbortController().signal,
      };

      expect(spyOnFetchExceptionListItemById).toHaveBeenCalledWith(expected);
    });
  });

  describe('updateExceptionListItem', () => {
    test('it removes exception item entry ids', async () => {
      const payload = getExceptionListItemSchemaMock();
      const itemToUpdate = { ...getUpdateExceptionListItemSchemaMock(), entries: ENTRIES_WITH_IDS };
      const spyOnUpdateExceptionListItem = jest
        .spyOn(api, 'updateExceptionListItem')
        .mockResolvedValue(payload);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.updateExceptionListItem({
          listItem: itemToUpdate,
        });
      });

      const expected: UpdateExceptionListItemProps = {
        http: mockKibanaHttpService,
        listItem: getUpdateExceptionListItemSchemaMock(),
        signal: new AbortController().signal,
      };

      expect(spyOnUpdateExceptionListItem).toHaveBeenCalledWith(expected);
    });
  });

  describe('duplicateExceptionList', () => {
    test('it invokes "onSuccess" when duplication does not throw', async () => {
      const onSuccessMock = jest.fn();
      const spyOnDuplicateExceptionList = jest
        .spyOn(api, 'duplicateExceptionList')
        .mockResolvedValue(getExceptionListSchemaMock());

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.duplicateExceptionList({
          includeExpiredExceptions: false,
          listId: 'my_list',
          namespaceType: 'single',
          onError: jest.fn(),
          onSuccess: onSuccessMock,
        });
      });

      const expected: DuplicateExceptionListProps = {
        http: mockKibanaHttpService,
        includeExpiredExceptions: false,
        listId: 'my_list',
        namespaceType: 'single',
        signal: new AbortController().signal,
      };

      expect(spyOnDuplicateExceptionList).toHaveBeenCalledWith(expected);
      expect(onSuccessMock).toHaveBeenCalled();
    });

    test('invokes "onError" callback if "duplicateExceptionList" fails', async () => {
      const mockError = new Error('failed to duplicate item');
      jest.spyOn(api, 'duplicateExceptionList').mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockKibanaHttpService));
      await waitFor(() => new Promise((resolve) => resolve(null)));

      await act(async () => {
        await result.current.duplicateExceptionList({
          includeExpiredExceptions: false,
          listId: 'my_list',
          namespaceType: 'single',
          onError: onErrorMock,
          onSuccess: jest.fn(),
        });
      });

      expect(onErrorMock).toHaveBeenCalledWith(mockError);
    });
  });
});
