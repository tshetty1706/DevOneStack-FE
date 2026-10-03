import api from './axios';

export const communityApi = {
  getFeed: (params) => api.get('/api/community/feed', { params }).then((r) => r.data),
  getDiscoverSpaces: (params) => api.get('/api/community/discover-spaces', { params }).then((r) => r.data),
  createPost: (payload) => api.post('/api/community/posts', payload).then((r) => r.data),
  updatePost: (postId, payload) => api.patch(`/api/community/posts/${postId}`, payload).then((r) => r.data),
  deletePost: (postId) => api.delete(`/api/community/posts/${postId}`).then((r) => r.data),
  toggleLikePost: (postId) => api.post(`/api/community/posts/${postId}/like`).then((r) => r.data),
  getPostComments: (postId, params) => api.get(`/api/community/posts/${postId}/comments`, { params }).then((r) => r.data),
  createPostComment: (postId, payload) => api.post(`/api/community/posts/${postId}/comments`, payload).then((r) => r.data),
  deletePostComment: (commentId) => api.delete(`/api/community/comments/${commentId}`).then((r) => r.data),
  followUser: (userId) => api.post(`/api/community/users/${userId}/follow`).then((r) => r.data),
  unfollowUser: (userId) => api.delete(`/api/community/users/${userId}/follow`).then((r) => r.data),
  getUserFollowers: (userId, params) => api.get(`/api/community/users/${userId}/followers`, { params }).then((r) => r.data),
  getUserFollowing: (userId, params) => api.get(`/api/community/users/${userId}/following`, { params }).then((r) => r.data),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/community/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  getPublicProfile: (username) => api.get(`/api/community/users/${username}/public-profile`).then((r) => r.data),
};

export default communityApi;
