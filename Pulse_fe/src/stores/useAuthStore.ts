import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

// Helper to set/remove cookie for middleware
function setAuthCookie(isAuthenticated: boolean) {
    if (typeof document === 'undefined') return;
    if (isAuthenticated) {
        document.cookie = `pulse-auth-status=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
        document.cookie = 'pulse-auth-status=; path=/; max-age=0';
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (user, accessToken, refreshToken) => {
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                setAuthCookie(true);
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setAuthCookie(false);
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'pulse-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
