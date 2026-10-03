import api from './axios';

export const inboxApi = {
  getUnreadCount: () => api.get('/api/inbox/unread-count').then((r) => r.data),
  getItems: (params) => api.get('/api/inbox/items', { params }).then((r) => r.data),
  markRead: (tab) => api.post('/api/inbox/mark-read', { tab }).then((r) => r.data),
  handleCloneRequestAction: (requestId, payload) =>
    api.post(`/api/inbox/requests/${requestId}/action`, payload).then((r) => r.data),
  handleCollaborationInviteAction: (inviteId, payload) =>
    api.post(`/api/inbox/invitations/${inviteId}/action`, payload).then((r) => r.data),
};

export default inboxApi;
