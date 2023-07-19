import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { QueryClient } from '@tanstack/query-core';
import type { MutationFilters } from '@tanstack/query-core';

export function isMutating(filters?: MutationFilters): Signal<number> {
  const queryClient = inject(QueryClient);
  const mutationCache = queryClient.getMutationCache();
  const mutations = signal(queryClient.isMutating(filters));
  const unsubscribe = mutationCache.subscribe(() => {
    mutations.set(queryClient.isMutating(filters));
  });
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => {
    unsubscribe();
  });

  return mutations;
}
