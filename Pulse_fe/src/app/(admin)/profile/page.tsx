"use client";
import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        {/* Avatar & Name */}
        <div className="flex items-center gap-5 px-6 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-brand-500 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">First Name</label>
              <p className="text-sm font-medium text-gray-900 dark:text-white px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{user.firstName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Last Name</label>
              <p className="text-sm font-medium text-gray-900 dark:text-white px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{user.lastName}</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
            <p className="text-sm font-medium text-gray-900 dark:text-white px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
