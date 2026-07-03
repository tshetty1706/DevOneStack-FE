import { useQuery } from '@tanstack/react-query';
import { MOCK_STATS } from '../mock/data';

// Returns mock stats — swap the queryFn with a real API call when backend is ready
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      // TODO: replace with → api.get('/stats').then(r => r.data)
      return MOCK_STATS;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
