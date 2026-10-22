import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '../api/resourcesApi';
import { useAuth } from '../context/AuthContext';
import { message } from 'antd';

export const dashboardKeys = {
  all: ['dashboard'],
  history: (userId) => ['dashboard', userId || 'guest', 'history'],
  pinned: (userId) => ['dashboard', userId || 'guest', 'pinned'],
  inbox: (userId) => ['dashboard', userId || 'guest', 'inbox'],
};

export function useRecentActivity() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  return useQuery({
    queryKey: dashboardKeys.history(userId),
    queryFn: dashboardApi.getRecentActivity,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePinnedResources() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  return useQuery({
    queryKey: dashboardKeys.pinned(userId),
    queryFn: dashboardApi.getPinned,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

export function useQuickInbox() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

  const query = useQuery({
    queryKey: dashboardKeys.inbox(userId),
    queryFn: dashboardApi.getInbox,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
  });

  const addItemMutation = useMutation({
    mutationFn: dashboardApi.addToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      message.success('Item saved to quick inbox');
    },
    onError: (err) => {
      message.error(err?.response?.data?.message || 'Failed to save item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: dashboardApi.deleteInboxItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
