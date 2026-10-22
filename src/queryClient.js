import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3, // 3 minutes stale time
      gcTime: 1000 * 60 * 10,   // 10 minutes cache retention
      retry: 1,
    },
  },
});

export default queryClient;
