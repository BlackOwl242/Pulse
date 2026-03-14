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
    { label: "Projects", value: overview.projects, color: "from-brand-500 to-blue-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg> },
    { label: "Total Tasks", value: overview.tasks, color: "from-emerald-500 to-teal-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg> },
    { label: "Completed", value: overview.completedTasks, color: "from-green-500 to-emerald-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Overdue", value: overview.overdueTasks, color: "from-red-500 to-rose-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg> },
    { label: "Members", value: overview.members, color: "from-purple-500 to-violet-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
    { label: "Time Tracked", value: `${Math.round(overview.totalTimeMinutes / 60)}h`, color: "from-amber-500 to-orange-600",
      icon: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
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
                  <span className="text-gray-500 dark:text-gray-400">{card.icon}</span>
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
