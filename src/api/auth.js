import api from "./axios";

export const signup = (data) => api.post("/api/auth/signup", data).then((r) => r.data);
export const login = (data) => api.post("/api/auth/login", data).then((r) => r.data);
export const logout = () => api.post("/api/auth/logout").then((r) => r.data);
export const getCurrentUser = () => api.get("/api/auth/me").then((r) => r.data);

export const googleAuthUrl = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/auth/google`;