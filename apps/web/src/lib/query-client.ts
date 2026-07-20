import { QueryClient } from '@tanstack/react-query';

// One shared cache for all server data. `staleTime` says how long a fetched
// result is considered fresh before TanStack Query will refetch it in the
// background. We'll tune these numbers later.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});
