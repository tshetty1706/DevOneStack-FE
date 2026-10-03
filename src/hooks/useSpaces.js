import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import spacesApi from '../api/spacesApi';
import { message } from 'antd';

export const spaceKeys = {
  all: ['spaces'],
  list: (params) => ['spaces', 'list', params],
  detail: (id) => ['spaces', 'detail', id],
  history: (id) => ['spaces', 'history', id],
};

export function useSpaces(params) {
  return useQuery({
    queryKey: params ? spaceKeys.list(params) : spaceKeys.all,
    queryFn: () => spacesApi.getSpaces(params),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

export function useSpace(spaceId) {
  return useQuery({
    queryKey: spaceKeys.detail(spaceId),
    queryFn: () => spacesApi.getSpaceById(spaceId),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 3,
  });
}

export function useSpaceHistory(spaceId) {
  return useQuery({
    queryKey: spaceKeys.history(spaceId),
    queryFn: () => spacesApi.getSpaceHistory(spaceId),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSpaceMutations() {
  const queryClient = useQueryClient();

  const createSpace = useMutation({
    mutationFn: spacesApi.createSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      message.success('Space created successfully');
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to create space');
    },
  });

  const updateSpace = useMutation({
    mutationFn: ({ spaceId, data }) => spacesApi.updateSpace(spaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      queryClient.invalidateQueries({ queryKey: spaceKeys.detail(variables.spaceId) });
      message.success('Space updated');
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to update space');
    },
  });

  const toggleStar = useMutation({
    mutationFn: (spaceId) => spacesApi.toggleStarSpace(spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || 'Failed to update star');
    },
  });

  const deleteSpace = useMutation({
    mutationFn: (spaceId) => spacesApi.deleteSpace(spaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spaceKeys.all });
      message.success('Space deleted');
    },
    onError: (err) => {
      message.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete space');
    },
  });

  return {
    createSpace: createSpace.mutateAsync,
    isCreating: createSpace.isPending,
    updateSpace: updateSpace.mutateAsync,
    isUpdating: updateSpace.isPending,
    toggleStar: toggleStar.mutateAsync,
    isTogglingStar: toggleStar.isPending,
    deleteSpace: deleteSpace.mutateAsync,
    isDeleting: deleteSpace.isPending,
  };
}

