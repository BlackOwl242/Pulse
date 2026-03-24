"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

export default function KeycloakCallback() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState("Authenticating...");
  const [error, setError] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      // Parse token from URL search (Authorization Code Flow)
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get("code");
      
      if (!code) {
        const err = queryParams.get("error") || queryParams.get("error_description");
        if (err) {
          setError(`Authentication error: ${err}`);
        } else {
          setError("Authorization code missing in the callback.");
        }
        return;
      }

      try {
        setStatus("Verifying account...");
        // Send Authorization Code to our backend to exchange it for a Pulse JWT
        const redirectUri = window.location.origin + window.location.pathname;
        const res = await authService.googleLogin(code, redirectUri);
        
        // Success! Log the user in
        setAuth(res.user, res.accessToken);
        
        // Clean URL from tokens and redirect to dashboard
        window.history.replaceState({}, document.title, window.location.pathname);
        router.push("/dashboard");
      } catch (err: any) {
        console.error("Google verify error", err);
        const message = err?.response?.data?.message || err.message || "Login authentication failed.";
        setError(message);
      }
    };

    processCallback();
  }, [router, setAuth]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center items-center min-h-[50vh]">
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        {!error ? (
          <div>
            <svg className="w-12 h-12 mx-auto animate-spin text-brand-500 mb-4" viewBox="0 0 24 24" fill="none">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Please wait</h2>
            <p className="text-gray-500 dark:text-gray-400">{status}</p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Login Failed</h2>
            <p className="text-red-500 dark:text-red-400 mb-6 text-sm">
              {error}
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-lg transition-colors text-sm font-medium"
            >
              <ChevronLeftIcon />
              Return to Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
