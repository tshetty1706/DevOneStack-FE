import api from './axios';

export const cloneApi = {
  clonePublicSpace: (spaceId) => api.post(`/api/clone/public/${spaceId}`).then((r) => r.data),
  getRequestLinkInfo: (token) => api.get(`/api/clone/request-link/${token}`).then((r) => r.data),
  createPrivateSpaceRequest: (token, payload) =>
    api.post(`/api/clone/request-link/${token}/request`, payload).then((r) => r.data),
  executeApprovedClone: (requestId) =>
    api.post(`/api/clone/requests/${requestId}/execute`).then((r) => r.data),
  toggleRequestLink: (spaceId, payload) =>
    api.post(`/api/spaces/${spaceId}/request-link`, payload).then((r) => r.data),
  regenerateRequestLink: (spaceId) =>
    api.post(`/api/spaces/${spaceId}/request-link/regenerate`).then((r) => r.data),
};

export default cloneApi;
