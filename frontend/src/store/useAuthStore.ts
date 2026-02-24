import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axios';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: number;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setTokens: (accessToken, refreshToken) => set({
                accessToken,
                refreshToken,
                isAuthenticated: !!accessToken
            }),

            setUser: (user) => set({ user }),

            logout: async () => {
                const { accessToken } = get();
                if (accessToken) {
                    try {
                        await axiosInstance.post('/auth/logout');
                    } catch (e) {
                        console.error('Logout API failed', e);
                    }
                }
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            fetchProfile: async () => {
                try {
                    const res = await axiosInstance.get('/users/me');
                    set({ user: res.data.data }); // Standard API Response decorateur: .data.data
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    // get().logout(); // Si le token est invalide on déconnecte
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken }), // Persist only tokens
        }
    )
);
