"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * AuthGuard wraps protected pages.
 * It waits for Zustand hydration from localStorage before checking auth.
 * Without waiting, the initial state (isAuthenticated=false) would cause
 * an immediate redirect on every page load / navigation.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, accessToken, logout } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);
    const [checked, setChecked] = useState(false);

    // Wait for Zustand persist hydration to complete
    useEffect(() => {
        // Zustand persist middleware exposes onFinishHydration
        const unsub = useAuthStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });

        // If already hydrated (e.g., fast subsequent renders)
        if (useAuthStore.persist.hasHydrated()) {
            setHydrated(true);
        }

        return unsub;
    }, []);

    // Once hydrated, check auth state
    useEffect(() => {
        if (!hydrated) return;

        if (!isAuthenticated || !accessToken) {
            logout();
            router.replace("/signin");
            return;
        }

        setChecked(true);
    }, [hydrated, isAuthenticated, accessToken, logout, router]);

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
