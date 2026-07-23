import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Request interceptor — attach access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem("refresh");
            if (refresh) {
                try {
                    const res = await axios.post(
                        "http://127.0.0.1:8000/api/accounts/login/refresh/",
                        { refresh }
                    );
                    localStorage.setItem("access", res.data.access);
                    originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            } else {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;