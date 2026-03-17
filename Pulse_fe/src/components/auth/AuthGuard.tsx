"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, hasAuthCookie } from "@/stores/useAuthStore";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5182";

/**
 * AuthGuard wraps protected pages.
 * On mount, it checks the pulse-auth-status cookie:
 * - If cookie exists and no access token → try silent refresh via httpOnly cookie
 * - If no cookie → redirect to signin
 * No localStorage is used for auth state.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, accessToken, setAuth, logout } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            // If already authenticated with token in memory, we're good
            if (isAuthenticated && accessToken) {
                setChecked(true);
                return;
            }

            // Check if we have the auth cookie (session might exist)
            if (hasAuthCookie()) {
                try {
                    // Try to restore session from httpOnly refresh token cookie
                    const { data } = await axios.post(
                        `${API_BASE_URL}/api/auth/refresh-token`,
                        {},
                        { withCredentials: true }
                    );
                    if (data.accessToken && data.user) {
                        setAuth(data.user, data.accessToken);
                        setChecked(true);
                        return;
                    }
                } catch {
                    // Refresh failed — clear cookie and redirect
                    logout();
                    router.replace("/signin");
                    return;
                }
            }

            // No cookie and not authenticated → redirect
            if (!isAuthenticated) {
                logout();
                router.replace("/signin");
                return;
            }

            setChecked(true);
        };

        checkAuth();
    }, [isAuthenticated, accessToken, setAuth, logout, router]);

    if (!checked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="w-8 h-8 animate-spin text-brand-500"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span className="text-sm text-gray-500">Verifying session...</span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
