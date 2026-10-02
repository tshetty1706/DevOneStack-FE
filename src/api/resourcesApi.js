import api from './axios';

export const docsApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/docs`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/docs/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  createFile: (spaceId, formData) => api.post(`/api/spaces/${spaceId}/docs`, formData).then((r) => r.data),
  createUrl: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/docs/url`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/docs/${id}`, payload).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/docs/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/docs/${id}/pin`).then((r) => r.data),
  downloadFile: (spaceId, id) => api.get(`/api/spaces/${spaceId}/docs/${id}/file`, { responseType: 'blob' }),
};

export const learningsApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/learnings`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/learnings/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  create: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/learnings`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/learnings/${id}`, payload).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/learnings/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/learnings/${id}/pin`).then((r) => r.data),
};

export const snippetsApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/snippets`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/snippets/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  create: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/snippets`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/snippets/${id}`, payload).then((r) => r.data),
  updateContent: (spaceId, id, code) => api.patch(`/api/spaces/${spaceId}/snippets/${id}/content`, { code }).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/snippets/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/snippets/${id}/pin`).then((r) => r.data),
  getContent: (spaceId, id) => api.get(`/api/spaces/${spaceId}/snippets/${id}/content`).then((r) => r.data),
  markUsed: (spaceId, id) => api.post(`/api/spaces/${spaceId}/snippets/${id}/use`).then((r) => r.data),
};

export const reposApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/repos`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/repos/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  create: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/repos`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/repos/${id}`, payload).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/repos/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/repos/${id}/pin`).then((r) => r.data),
};

export const promptsApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/prompts`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/prompts/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  create: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/prompts`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/prompts/${id}`, payload).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/prompts/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/prompts/${id}/pin`).then((r) => r.data),
  markUsed: (spaceId, id) => api.post(`/api/spaces/${spaceId}/prompts/${id}/use`).then((r) => r.data),
};

export const communitiesApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/communities`).then((r) => r.data),
  search: (spaceId, query) => api.get(`/api/spaces/${spaceId}/communities/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
  create: (spaceId, payload) => api.post(`/api/spaces/${spaceId}/communities`, payload).then((r) => r.data),
  update: (spaceId, id, payload) => api.patch(`/api/spaces/${spaceId}/communities/${id}`, payload).then((r) => r.data),
  delete: (spaceId, id) => api.delete(`/api/spaces/${spaceId}/communities/${id}`).then((r) => r.data),
  togglePin: (spaceId, id) => api.patch(`/api/spaces/${spaceId}/communities/${id}/pin`).then((r) => r.data),
};

export const tagsApi = {
  getAll: (spaceId) => api.get(`/api/spaces/${spaceId}/tags`).then((r) => r.data),
  getContentByTag: (spaceId, tag) => api.get(`/api/spaces/${spaceId}/tags/${encodeURIComponent(tag)}/content`).then((r) => r.data),
  renameTag: (spaceId, oldTag, newTag) => api.patch(`/api/spaces/${spaceId}/tags/rename`, { oldTag, newTag }).then((r) => r.data),
  deleteTag: (spaceId, tag) => api.delete(`/api/spaces/${spaceId}/tags/${encodeURIComponent(tag)}`).then((r) => r.data),
};

export const dashboardApi = {
  getRecentActivity: () => api.get('/api/history').then((r) => r.data),
  getPinned: () => api.get('/api/dashboard/pinned').then((r) => r.data),
  getInbox: () => api.get('/api/inbox').then((r) => r.data),
  addToInbox: (payload) => api.post('/api/inbox', payload).then((r) => r.data),
  deleteInboxItem: (id) => api.delete(`/api/inbox/${id}`).then((r) => r.data),
};
