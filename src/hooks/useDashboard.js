import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/resourcesApi';
import { message } from 'antd';

export const dashboardKeys = {
  all: ['dashboard'],
  history: ['dashboard', 'history'],
  pinned: ['dashboard', 'pinned'],
  inbox: ['dashboard', 'inbox'],
};

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.history,
    queryFn: dashboardApi.getRecentActivity,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePinnedResources() {
  return useQuery({
    queryKey: dashboardKeys.pinned,
    queryFn: dashboardApi.getPinned,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useQuickInbox() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: dashboardKeys.inbox,
    queryFn: dashboardApi.getInbox,
    staleTime: 1000 * 60 * 2,
  });

  const addItemMutation = useMutation({
    mutationFn: dashboardApi.addToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.inbox });
      message.success('Item saved to quick inbox');
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Failed to save item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: dashboardApi.deleteInboxItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.inbox });
      message.success('Item removed from inbox');
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Failed to remove item');
    },
  });

  return {
    ...query,
    addItem: addItemMutation.mutateAsync,
    isAdding: addItemMutation.isPending,
    deleteItem: deleteItemMutation.mutateAsync,
    isDeleting: deleteItemMutation.isPending,
  };
}
