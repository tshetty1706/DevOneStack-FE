import api from "./axios";

export const signup = (data) => api.post("/api/auth/signup", data).then((r) => r.data);
export const login = (data) => api.post("/api/auth/login", data).then((r) => r.data);
export const logout = () => api.post("/api/auth/logout").then((r) => r.data);
export const getCurrentUser = () => api.get("/api/auth/me").then((r) => r.data);
export const forgotPassword = (email) => api.post("/api/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (token, password, confirmPassword) => api.post(`/api/auth/reset-password/${token}`, { password, confirmPassword }).then((r) => r.data);

const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:9000';
export const googleLoginUrl = `${baseUrl}/api/auth/google?mode=login`;
export const googleSignupUrl = `${baseUrl}/api/auth/google?mode=signup`;
export const googleAuthUrl = googleLoginUrl;