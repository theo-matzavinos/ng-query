import { QueryClient, type QueryFilters } from '@tanstack/query-core';

import type { NgQueryKey } from './query-key';
import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';

export function isFetching(
  filters?: Omit<QueryFilters, 'queryKey'> & { queryKey?: NgQueryKey }
): Signal<number> {
  const queryClient = inject(QueryClient);
  const filtersSignal = computed(() => ({
    ...filters,
    queryKey: filters?.queryKey?.(),
  }));
  const fetches = signal(queryClient.isFetching(filtersSignal()));
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    fetches.set(queryClient.isFetching(filtersSignal()));
  });
  const destroyRef = inject(DestroyRef);

  destroyRef.onDestroy(() => {
    unsubscribe();
  });

  return fetches;
}
