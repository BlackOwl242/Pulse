"use client";
import React, { useEffect, useState, useCallback } from "react";
import { analyticsService, OverviewStats, WorkloadEntry } from "@/services/analyticsService";

export default function ReportsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [workload, setWorkload] = useState<WorkloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const slug = "pulse-demo";

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, wl] = await Promise.all([analyticsService.getOverview(slug), analyticsService.getWorkload(slug)]);
      setOverview(ov); setWorkload(wl);
    } catch {} setLoading(false);
  }, [slug]);
  useEffect(() => { fetch(); }, [fetch]);

  // Group workload by user
  const userMap = workload.reduce((acc, w) => {
    const key = w.userId;
    if (!acc[key]) acc[key] = { user: w.user, total: 0, completed: 0, overdue: 0, minutes: 0, rate: 0 };
    acc[key].total += w.totalTasks;
    acc[key].completed += w.completedTasks;
    acc[key].overdue += w.overdueTasks;
    acc[key].minutes += w.totalMinutesTracked;
    acc[key].rate = w.completionRate;
    return acc;
  }, {} as Record<string, { user: { firstName: string; lastName: string }; total: number; completed: number; overdue: number; minutes: number; rate: number }>);

  const statCards = overview ? [
    { label: "Projects", value: overview.projects, icon: "📂", color: "from-brand-500 to-blue-600" },
    { label: "Total Tasks", value: overview.tasks, icon: "📋", color: "from-emerald-500 to-teal-600" },
    { label: "Completed", value: overview.completedTasks, icon: "✅", color: "from-green-500 to-emerald-600" },
    { label: "Overdue", value: overview.overdueTasks, icon: "⚠️", color: "from-red-500 to-rose-600" },
    { label: "Members", value: overview.members, icon: "👥", color: "from-purple-500 to-violet-600" },
    { label: "Time Tracked", value: `${Math.round(overview.totalTimeMinutes / 60)}h`, icon: "⏱️", color: "from-amber-500 to-orange-600" },
  ] : [];

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Workspace performance overview</p>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{card.icon}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Completion Rate */}
          {overview && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Overall Completion</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-green-500 transition-all" style={{ width: `${overview.completionRate}%` }} />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{overview.completionRate}%</span>
              </div>
            </div>
          )}

          {/* Workload Table */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Workload</h3>
            </div>
            {Object.keys(userMap).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-400">No workload data available yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Member</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Total</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Done</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Overdue</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Time</th>
                      <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {Object.values(userMap).map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                              {entry.user.firstName?.charAt(0)}{entry.user.lastName?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{entry.user.firstName} {entry.user.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{entry.total}</td>
                        <td className="px-4 py-3 text-center text-green-600">{entry.completed}</td>
                        <td className="px-4 py-3 text-center text-red-500">{entry.overdue}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{Math.round(entry.minutes / 60)}h</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${entry.rate >= 80 ? "bg-green-500" : entry.rate >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                style={{ width: `${entry.rate}%` }} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">{entry.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
