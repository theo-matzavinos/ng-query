import { Provider } from '@angular/core';
import { QueryClient, QueryClientConfig } from '@tanstack/query-core';

export function provideQueryClient(config?: QueryClientConfig): Provider[] {
  return [{ provide: QueryClient, useFactory: () => new QueryClient(config) }];
}

export { query } from './lib/query';
export { mutation } from './lib/mutation';
export { createInfiniteQuery } from './lib/infinite-query';
export { isFetching } from './lib/is-fetching';
export { isMutating as useIsMutating } from './lib/is-mutating';
