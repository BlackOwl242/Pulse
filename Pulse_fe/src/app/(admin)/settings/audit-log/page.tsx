"use client";
import React, { useEffect, useState, useCallback } from "react";
import { activityService, ActivityItem } from "@/services/activityService";
import { useSlug } from "@/hooks/useSlug";

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  updated: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  deleted: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  completed: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
};

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AuditLogPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);
  const slug = useSlug();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityService.getAll(slug, limit);
      setActivities(data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [slug, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all activity across your workspace
          </p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0 mt-0.5">
                  {a.actor.firstName?.charAt(0)}{a.actor.lastName?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{a.actor.firstName} {a.actor.lastName}</span>
                    <span className="text-gray-500 dark:text-gray-400"> {a.description}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[a.action.toLowerCase()] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                      {a.action}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{a.entityType}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 mt-1">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length >= limit && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setLimit((l) => l + 50)}
            className="px-4 py-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
