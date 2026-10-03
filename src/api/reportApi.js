import api from './axios';

export const reportApi = {
  createReport: (payload) => api.post('/api/report', payload).then((r) => r.data),
  blockUser: (userId) => api.post('/api/report/block-user', { userId }).then((r) => r.data),
  muteUser: (userId) => api.post('/api/report/mute-user', { userId }).then((r) => r.data),
};

export default reportApi;
