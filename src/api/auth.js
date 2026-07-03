import api from "./axios";

export const signup = (data) => api.post("/auth/signup", data).then((r) => r.data);
export const login = (data) => api.post("/auth/login", data).then((r) => r.data);
export const logout = () => api.post("/auth/logout").then((r) => r.data);
export const getCurrentUser = () => api.get("/auth/me").then((r) => r.data);

export const googleAuthUrl = `${import.meta.env.VITE_SERVER_URL}/api/auth/google`;
export const githubAuthUrl = `${import.meta.env.VITE_SERVER_URL}/api/auth/github`;