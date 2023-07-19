import { Signal } from '@angular/core';
import { InfiniteQueryObserver } from '@tanstack/query-core';
import { Observable } from 'rxjs';

import { baseQuery } from './base-query';

import type { NgQueryKey } from './query-key';
import type {
  InfiniteQueryObserverOptions,
  InfiniteQueryObserverResult,
  QueryFunctionContext,
} from '@tanstack/query-core';

export type NgInfiniteQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends NgQueryKey,
> = Omit<
  InfiniteQueryObserverOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryFnData,
    ReturnType<TQueryKey>
  >,
  'queryKey' | 'queryFn'
>;

type InfiniteQueryObserverResultMethods<
  TData = unknown,
  TError = unknown,
> = Pick<
  InfiniteQueryObserverResult<TData, TError>,
  'remove' | 'refetch' | 'fetchNextPage' | 'fetchPreviousPage'
>;

type InfiniteQueryObserverResultState<TData = unknown, TError = unknown> = Omit<
  InfiniteQueryObserverResult<TData, TError>,
  keyof InfiniteQueryObserverResultMethods
>;

export type NgInfiniteQueryResult<TData, TError> =
  InfiniteQueryObserverResultMethods<TData, TError> & {
    state: Signal<InfiniteQueryObserverResultState<TData, TError>>;
  };

export type NgInfiniteQueryFn<
  TQueryKey extends NgQueryKey,
  TPageParam,
  TQueryFnData,
> = (
  context: QueryFunctionContext<ReturnType<TQueryKey>, TPageParam>,
) => Observable<TQueryFnData>;

export function createInfiniteQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends NgQueryKey = NgQueryKey,
  TPageParam = any,
>(
  queryKey: TQueryKey,
  queryFn: NgInfiniteQueryFn<TQueryKey, TPageParam, TQueryFnData>,
  options?: () => NgInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  >,
): NgInfiniteQueryResult<TData, TError> {
  return baseQuery(
    queryKey,
    queryFn,
    options,
    InfiniteQueryObserver,
    splitinfiniteQueryResult<TData, TError>,
  );
}

function splitinfiniteQueryResult<TData = unknown, TError = unknown>(
  result: InfiniteQueryObserverResult<TData, TError>,
): {
  methods: InfiniteQueryObserverResultMethods<TData, TError>;
  state: InfiniteQueryObserverResultState<TData, TError>;
} {
  const { refetch, remove, fetchNextPage, fetchPreviousPage, ...state } =
    result;

  return {
    methods: { refetch, remove, fetchNextPage, fetchPreviousPage },
    state,
  };
}
