import {
  DestroyRef,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  QueryClient,
  type QueryObserver,
  QueryObserverOptions,
} from '@tanstack/query-core';
import { Observable, lastValueFrom } from 'rxjs';
import { Constructor } from 'type-fest';

import type { NgQueryKey } from './query-key';

export type NgBaseQueryOptions<
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

export function baseQuery<
  TQueryFnData,
  TError,
  TData,
  TQueryData,
  TQueryKey extends NgQueryKey,
  TState,
  TMethods,
  TObserver extends QueryObserver<
    TQueryFnData,
    TError,
    TData,
    TQueryData,
    ReturnType<TQueryKey>
  >,
  TResult extends ReturnType<TObserver['getOptimisticResult']>,
>(
  queryKey: TQueryKey,
  queryFn: (...args: any[]) => Observable<TQueryFnData>,
  options:
    | (() => NgBaseQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryData,
        TQueryKey
      >)
    | undefined,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Observer: Constructor<TObserver>,
  splitResult: (result: TResult) => {
    state: TState;
    methods: TMethods;
  },
): TMethods & { state: Signal<TState> } {
  const promisifiedQueryFn = (...args: any[]) => lastValueFrom(queryFn(args));
  const optionsSignal = computed(() => ({
    ...options?.(),
    queryFn: promisifiedQueryFn,
    queryKey: queryKey() as ReturnType<TQueryKey>,
  }));

  const queryClient = inject(QueryClient);
  const defaultedOptions = queryClient.defaultQueryOptions(optionsSignal());

  defaultedOptions._optimisticResults = 'optimistic';

  const observer = new Observer(queryClient, defaultedOptions);
  const optimisticResult = splitResult(
    observer.getOptimisticResult(defaultedOptions) as TResult,
  );
  const baseQueryState = signal(optimisticResult.state);
  const baseQueryResult = {
    ...optimisticResult.methods,
    state: baseQueryState.asReadonly(),
  };
  const unsubscribe = observer.subscribe((result) => {
    const { methods, state } = splitResult(result as TResult);

    Object.assign(baseQueryResult, methods);

    baseQueryState.set(state);
  });

  inject(DestroyRef).onDestroy(() => unsubscribe());

  effect(() => {
    const newDefaultedOptions = queryClient.defaultQueryOptions(
      optionsSignal(),
    );

    observer.setOptions(newDefaultedOptions);
  });

  return baseQueryResult;
}
