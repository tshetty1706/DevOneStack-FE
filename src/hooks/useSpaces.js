import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export function useSpaces() {
  return useQuery({
    queryKey: ['spaces'],
    queryFn: async () => {
      const { data } = await api.get('/api/spaces');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
