import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL + "/api",
    withCredentials: true, // sends/receives httpOnly cookies
});

// Auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;
            try {
                await api.post("/auth/refresh");
                return api(error.config);
            } catch {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;