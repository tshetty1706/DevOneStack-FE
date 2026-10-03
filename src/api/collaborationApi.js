import api from './axios';

export const collaborationApi = {
  getCollaborators: (spaceId) => api.get(`/api/spaces/${spaceId}/collaborators`).then((r) => r.data),
  inviteCollaborator: (spaceId, payload) =>
    api.post(`/api/spaces/${spaceId}/collaborators/invite`, payload).then((r) => r.data),
  updateCollaboratorRole: (spaceId, userId, payload) =>
    api.patch(`/api/spaces/${spaceId}/collaborators/${userId}`, payload).then((r) => r.data),
  removeCollaborator: (spaceId, userId) =>
    api.delete(`/api/spaces/${spaceId}/collaborators/${userId}`).then((r) => r.data),
};

export default collaborationApi;
