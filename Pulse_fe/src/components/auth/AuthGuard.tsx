"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * AuthGuard wraps protected pages.
 * It checks the Zustand auth state on mount:
 *  - If not authenticated → clear stale cookie + redirect to /signin
 *  - If authenticated → render children
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, accessToken, logout } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        // Zustand persisted state is the source of truth
        if (!isAuthenticated || !accessToken) {
            // Clear any stale cookie so middleware won't redirect again
            logout();
            router.replace("/signin");
            return;
        }

        setChecked(true);
    }, [isAuthenticated, accessToken, logout, router]);

    if (!checked) {
        // Show a minimal loading state while checking auth
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
