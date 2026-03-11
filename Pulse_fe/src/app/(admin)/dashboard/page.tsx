"use client";
import React, { useEffect, useState } from "react";
import { projectService, Project } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { roleService } from "@/services/roleService";
import { useAuthStore } from "@/stores/useAuthStore";
import { BoardColumn } from "@/types/task";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  // TODO: Replace with actual workspace slug from context
  const slug = "pulse-demo";

  useEffect(() => {
    async function load() {
      try {
        const [projs, members] = await Promise.all([
          projectService.getAll(slug).catch(() => []),
          roleService.getMembers(slug).catch(() => []),
        ]);
        setProjects(projs);
        setMemberCount(members.length);

        // Fetch board data for task status distribution (first 5 projects)
        if (projs.length > 0) {
          const boards = await Promise.all(
            projs.slice(0, 5).map((p: Project) =>
              taskService.getBoardView(slug, p.id).catch(() => [] as BoardColumn[])
            )
          );
          const counts: Record<string, number> = {};
          boards.flat().forEach((col) => {
            const name = col.name;
            counts[name] = (counts[name] || 0) + col.tasks.length;
          });
          setStatusCounts(counts);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const totalTasks = projects.reduce((s, p) => s + p.taskCount, 0);
  const completedTasks = projects.reduce((s, p) => s + p.completedTaskCount, 0);
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const firstName = user?.firstName || "User";

  return (
    <div className="space-y-6 p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your workspace activity
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={loading ? "—" : String(projects.length)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
          color="brand"
        />
        <MetricCard
          title="Active Tasks"
          value={loading ? "—" : String(activeTasks)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          }
          color="blue"
        />
        <MetricCard
          title="Team Members"
          value={loading ? "—" : String(memberCount)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          color="green"
        />
        <MetricCard
          title="Completed"
          value={loading ? "—" : `${completedTasks} (${completionRate}%)`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
      </div>

      {/* Charts Row */}
      {!loading && totalTasks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Task Status Distribution — CSS Donut */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Task Distribution</h3>
            <div className="flex items-center gap-6">
              <DonutChart counts={statusCounts} total={totalTasks} />
              <div className="space-y-2 flex-1">
                {STATUS_DISPLAY.map((s) => {
                  const count = statusCounts[s.key] || 0;
                  if (count === 0) return null;
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{s.label}</span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{count}</span>
                      <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Workload by Project */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Workload by Project</h3>
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => {
                const pct = p.taskCount > 0 ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">{p.completedTaskCount}/{p.taskCount} done</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color || '#6366f1' }} />
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No projects yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Projects Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Projects</h2>
          <a href="/projects" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
            View all →
          </a>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10">
              <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No projects yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Create your first project to get started
            </p>
            <a href="/projects" className="mt-3 inline-block text-sm text-brand-500 hover:text-brand-600 font-medium">
              Go to Projects →
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {projects.slice(0, 5).map((project) => {
              const progress = project.taskCount > 0
                ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;
              return (
                <a
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: project.color || "#6366f1" }}
                  >
                    {project.icon || project.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.completedTaskCount}/{project.taskCount} tasks completed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color || "#6366f1",
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">
                      {progress}%
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title, value, icon, color,
}: {
  title: string; value: string; icon: React.ReactNode;
  color: "brand" | "blue" | "green" | "purple";
}) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white/90">{value}</p>
        </div>
      </div>
    </div>
  );
}

const STATUS_DISPLAY = [
  { key: "Todo",       label: "To Do",       color: "#9ca3af", dot: "bg-gray-400" },
  { key: "InProgress", label: "In Progress", color: "#3b82f6", dot: "bg-blue-500" },
  { key: "InReview",   label: "In Review",   color: "#f59e0b", dot: "bg-amber-500" },
  { key: "Done",       label: "Done",        color: "#22c55e", dot: "bg-green-500" },
  { key: "Cancelled",  label: "Cancelled",   color: "#ef4444", dot: "bg-red-400" },
];

function DonutChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  // Build conic-gradient segments
  let angle = 0;
  const segments: string[] = [];
  STATUS_DISPLAY.forEach((s) => {
    const count = counts[s.key] || 0;
    if (count === 0) return;
    const deg = (count / total) * 360;
    segments.push(`${s.color} ${angle}deg ${angle + deg}deg`);
    angle += deg;
  });
  const gradient = segments.length > 0
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#e5e7eb 0deg 360deg)";

  return (
    <div className="relative w-28 h-28 shrink-0">
      <div className="w-full h-full rounded-full" style={{ background: gradient }} />
      <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
          <p className="text-[10px] text-gray-400">tasks</p>
        </div>
      </div>
    </div>
  );
}

