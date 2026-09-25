import api from './axios';

export const spacesApi = {
  getSpaces: () => api.get('/api/spaces').then((r) => r.data),
  getSpaceById: (spaceId) => api.get(`/api/spaces/${spaceId}`).then((r) => r.data),
  createSpace: (payload) => api.post('/api/spaces', payload).then((r) => r.data),
  updateSpace: (spaceId, payload) => api.patch(`/api/spaces/${spaceId}`, payload).then((r) => r.data),
  deleteSpace: (spaceId) => api.delete(`/api/spaces/${spaceId}`).then((r) => r.data),
  recountSpace: (spaceId) => api.patch(`/api/spaces/${spaceId}/recount`).then((r) => r.data),
  getSpaceHistory: (spaceId) => api.get(`/api/history?spaceId=${spaceId}`).then((r) => r.data),
};

export default spacesApi;
