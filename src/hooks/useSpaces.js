import { useQuery } from '@tanstack/react-query';
import { MOCK_SPACES } from '../mock/data';

// Returns mock spaces — swap the queryFn with a real API call when backend is ready
export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      // TODO: replace with → api.get('/spaces').then(r => r.data)
      return MOCK_SPACES;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
