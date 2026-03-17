import { create } from 'zustand';
import { User } from '@/types/auth';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: User, accessToken: string) => void;
    setAccessToken: (accessToken: string) => void;
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

// Helper to check if pulse-auth-status cookie exists
export function hasAuthCookie(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some((c) => c.trim().startsWith('pulse-auth-status=1'));
}

/**
 * Auth store — NO localStorage persistence.
 * - accessToken: in memory only (Zustand state)
 * - refreshToken: httpOnly cookie (never in JS)
 * - user info: in memory only, restored from refresh-token API on page load
 * - pulse-auth-status cookie: used by Next.js middleware for route protection
 */
export const useAuthStore = create<AuthState>()((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,

    setAuth: (user, accessToken) => {
        setAuthCookie(true);
        set({ user, accessToken, isAuthenticated: true });
    },

    setAccessToken: (accessToken) => {
        set({ accessToken });
    },

    logout: () => {
        setAuthCookie(false);
        // Clear workspace data
        try {
            const { useWorkspaceStore } = require('@/stores/useWorkspaceStore');
            useWorkspaceStore.getState().clear();
        } catch { /* ignore */ }
        set({ user: null, accessToken: null, isAuthenticated: false });
    },

    setLoading: (isLoading) => set({ isLoading }),
}));
