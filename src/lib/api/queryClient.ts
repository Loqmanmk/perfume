import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http';

/** Every cached server resource, named in one place so invalidation can't drift. */
export const queryKeys = {
  products: ['products'] as const,
  session: ['session'] as const,
  myOrders: ['orders', 'mine'] as const,
  allOrders: ['orders', 'all'] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // A 4xx will not fix itself by asking again.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
});
