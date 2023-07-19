import {
  MutationObserver,
  MutationObserverOptions,
  MutationObserverResult,
  QueryClient,
} from '@tanstack/query-core';

import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';

export type NgMutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = Omit<
  MutationObserverOptions<TData, TError, TVariables, TContext>,
  '_defaulted' | 'variables' | 'mutationFn'
>;

export type NgMutationFn<TVariables, TData> = (
  variables: TVariables
) => Observable<TData>;

type MutationObserverResultMethods<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = Pick<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  'mutate' | 'reset'
>;

type MutationObserverResultState<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
> = Omit<
  MutationObserverResult<TData, TError, TVariables, TContext>,
  keyof MutationObserverResultMethods
>;

export type NgMutationResult<TData, TError, TVariables, TContext> =
  MutationObserverResultMethods<TData, TError, TVariables, TContext> & {
    state: Signal<
      MutationObserverResultState<TData, TError, TVariables, TContext>
    >;
  };

export function mutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: NgMutationFn<TVariables, TData>,
  options?: NgMutationOptions<TData, TError, TVariables, TContext>
): NgMutationResult<TData, TError, TVariables, TContext> {
  const queryClient = inject(QueryClient);
  const promisifiedMutationFn = (args: TVariables) =>
    lastValueFrom(mutationFn(args));
  const observer = new MutationObserver<TData, TError, TVariables, TContext>(
    queryClient,
    {
      ...options,
      mutationFn: promisifiedMutationFn,
    }
  );
  const optimisticResult = splitMutationResult(observer.getCurrentResult());
  const mutationState = signal(optimisticResult.state);
  const mutationResult: NgMutationResult<TData, TError, TVariables, TContext> =
    {
      ...optimisticResult.methods,
      state: mutationState.asReadonly(),
    };
  const unsubscribe = observer.subscribe((result) => {
    const { methods, state } = splitMutationResult(result);

    Object.assign(methods);
    mutationState.set(state);
  });

  inject(DestroyRef).onDestroy(unsubscribe);

  return mutationResult;
}

function splitMutationResult<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  result: MutationObserverResult<TData, TError, TVariables, TContext>
): {
  methods: MutationObserverResultMethods<TData, TError, TVariables, TContext>;
  state: MutationObserverResultState<TData, TError, TVariables, TContext>;
} {
  const { mutate, reset, ...state } = result;

  return {
    methods: { mutate, reset },
    state,
  };
}
