import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// URL de base de notre API locale
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour injecter l'AccessToken
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour gérer l'expiration du token (Refresh Token Logic)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const rt = useAuthStore.getState().refreshToken;
                if (!rt) throw new Error('No refresh token');

                const res = await axios.post(`${API_URL}/auth/refresh`, null, {
                    headers: { Authorization: `Bearer ${rt}` },
                });

                const newAccessToken = res.data.accessToken;
                const newRefreshToken = res.data.refreshToken;

                useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
                console.log('Token refreshed successfully');

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (err) {
                // Si le refresh échoue, on déconnecte l'utilisateur
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
