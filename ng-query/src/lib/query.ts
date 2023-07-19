import { Signal } from '@angular/core';
import { QueryObserver } from '@tanstack/query-core';
import { Observable } from 'rxjs';

import { baseQuery } from './base-query';

import type { NgQueryKey } from './query-key';
import type {
  QueryFunctionContext,
  QueryKey,
  QueryObserverOptions,
  QueryObserverResult,
} from '@tanstack/query-core';

export type NgQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryData = TQueryFnData,
  TQueryKey extends NgQueryKey = NgQueryKey,
> = Omit<
  QueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    ReturnType<TQueryKey>
  >,
  'queryKey' | 'queryFn'
>;

export type NgQueryResult<TData, TError> = QueryObserverResultMethods<
  TData,
  TError
> & {
  state: Signal<QueryObserverResultState<TData, TError>>;
};

type QueryObserverResultMethods<TData = unknown, TError = unknown> = Pick<
  QueryObserverResult<TData, TError>,
  'remove' | 'refetch'
>;

type QueryObserverResultState<TData = unknown, TError = unknown> = Omit<
  QueryObserverResult<TData, TError>,
  keyof QueryObserverResultMethods
>;

export type NgQueryFn<TQueryFnData, TQueryKey extends QueryKey = QueryKey> = (
  context: QueryFunctionContext<TQueryKey>,
) => Observable<TQueryFnData>;

export function query<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends NgQueryKey = NgQueryKey,
  TQueryData = TQueryFnData,
>(
  queryKey: TQueryKey,
  queryFn: NgQueryFn<TQueryFnData, ReturnType<TQueryKey>>,
  options?: () => NgQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    TQueryKey
  >,
): NgQueryResult<TData, TError> {
  return baseQuery(
    queryKey,
    queryFn,
    options,
    QueryObserver,
    splitQueryResult<TData, TError>,
  );
}

function splitQueryResult<TData = unknown, TError = unknown>(
  result: QueryObserverResult<TData, TError>,
): {
  methods: QueryObserverResultMethods<TData, TError>;
  state: QueryObserverResultState<TData, TError>;
} {
  const { refetch, remove, ...state } = result;

  return {
    methods: { refetch, remove },
    state,
  };
}
