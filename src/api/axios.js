import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dos_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent token refresh on expiry
let refreshing = false;
let queue = [];

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    // If the request itself was to a login, signup, or refresh endpoint, do not attempt to refresh
    if (
      original?.url?.includes("/auth/refresh") ||
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/signup")
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && err.response?.data?.error === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then(token => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch(() => {
            return Promise.reject(err);
          });
      }
      refreshing = true;
      try {
        const { data } = await api.post('/api/auth/refresh');
        localStorage.setItem('dos_access_token', data.accessToken);
        queue.forEach(p => p.resolve(data.accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        queue.forEach(p => p.reject(refreshErr));
        queue = [];
        localStorage.removeItem('dos_access_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;