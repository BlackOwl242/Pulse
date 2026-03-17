import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5182';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Always send cookies (httpOnly refresh token)
});

// Request interceptor — attach access token from Zustand store (memory)
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Track refresh state to prevent multiple concurrent refreshes
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Response interceptor — handle 401 refresh via httpOnly cookie
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Cookie is sent automatically with withCredentials: true
                const { data } = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data.accessToken;

                // Update Zustand store (memory only — no localStorage)
                const store = useAuthStore.getState();
                if (store.user) {
                    store.setAccessToken(newAccessToken);
                }

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Clear auth state and redirect
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
