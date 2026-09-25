import { useQuery } from '@tanstack/react-query';
import {
  docsApi,
  learningsApi,
  snippetsApi,
  reposApi,
  promptsApi,
  communitiesApi,
  tagsApi,
} from '../api/resourcesApi';

export const resourceKeys = {
  docs: (spaceId, query = '') => ['docs', spaceId, { query }],
  learnings: (spaceId, query = '') => ['learnings', spaceId, { query }],
  snippets: (spaceId, query = '') => ['snippets', spaceId, { query }],
  repos: (spaceId, query = '') => ['repos', spaceId, { query }],
  prompts: (spaceId, query = '') => ['prompts', spaceId, { query }],
  communities: (spaceId, query = '') => ['communities', spaceId, { query }],
  tags: (spaceId) => ['tags', spaceId],
  tagContent: (spaceId, tag) => ['tags', spaceId, 'content', tag],
};

export function useDocs(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.docs(spaceId, query),
    queryFn: () => (query?.trim() ? docsApi.search(spaceId, query.trim()) : docsApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useLearnings(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.learnings(spaceId, query),
    queryFn: () => (query?.trim() ? learningsApi.search(spaceId, query.trim()) : learningsApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSnippets(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.snippets(spaceId, query),
    queryFn: () => (query?.trim() ? snippetsApi.search(spaceId, query.trim()) : snippetsApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRepos(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.repos(spaceId, query),
    queryFn: () => (query?.trim() ? reposApi.search(spaceId, query.trim()) : reposApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePrompts(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.prompts(spaceId, query),
    queryFn: () => (query?.trim() ? promptsApi.search(spaceId, query.trim()) : promptsApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCommunities(spaceId, query = '') {
  return useQuery({
    queryKey: resourceKeys.communities(spaceId, query),
    queryFn: () => (query?.trim() ? communitiesApi.search(spaceId, query.trim()) : communitiesApi.getAll(spaceId)),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTags(spaceId) {
  return useQuery({
    queryKey: resourceKeys.tags(spaceId),
    queryFn: () => tagsApi.getAll(spaceId),
    enabled: Boolean(spaceId),
    staleTime: 1000 * 60 * 2,
  });
}
