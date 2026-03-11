"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { projectService, Project } from "@/services/projectService";
import { roleService } from "@/services/roleService";
import { Task } from "@/types/task";
import { WorkspaceMember } from "@/types/roles";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "0", label: "To Do" },
  { value: "1", label: "In Progress" },
  { value: "2", label: "In Review" },
  { value: "3", label: "Done" },
  { value: "4", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All Priorities" },
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
  { value: "4", label: "Urgent" },
];

const STATUS_BADGES: Record<number, { label: string; cls: string }> = {
  0: { label: "To Do",       cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  1: { label: "In Progress", cls: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  2: { label: "In Review",   cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  3: { label: "Done",        cls: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  4: { label: "Cancelled",   cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
};

const PRIORITY_BADGES: Record<number, { label: string; cls: string }> = {
  0: { label: "",       cls: "" },
  1: { label: "Low",    cls: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
  2: { label: "Medium", cls: "text-amber-500 bg-amber-50 dark:bg-amber-500/10" },
  3: { label: "High",   cls: "text-orange-500 bg-orange-50 dark:bg-orange-500/10" },
  4: { label: "Urgent", cls: "text-red-500 bg-red-50 dark:bg-red-500/10" },
};

export default function TaskListPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const slug = "pulse-demo";

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams: { status?: string; priority?: string; assigneeId?: string; search?: string } = {};
      if (search) queryParams.search = search;
      if (statusFilter) queryParams.status = statusFilter;
      if (priorityFilter) queryParams.priority = priorityFilter;
      if (assigneeFilter) queryParams.assigneeId = assigneeFilter;

      const [proj, taskList, mems] = await Promise.all([
        projectService.getById(slug, projectId),
        taskService.getAll(slug, projectId, queryParams),
        roleService.getMembers(slug),
      ]);
      setProject(proj);
      setTasks(taskList);
      setMembers(mems);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, projectId, search, statusFilter, priorityFilter, assigneeFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.push(`/projects/${projectId}`)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        {project && (
          <>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: project.color || "#6366f1" }}>
              {project.icon || project.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{project.name} — Tasks</h1>
            </div>
          </>
        )}

        {/* Toggle to Board */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => router.push(`/projects/${projectId}`)}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg">
            Board View
          </button>
          <span className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
            List View
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none">
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none">
          <option value="">All Assignees</option>
          {members.map((m) => <option key={m.userId} value={m.userId}>{m.firstName} {m.lastName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Assignee</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map((task) => {
                const status = STATUS_BADGES[Number(task.status)] || STATUS_BADGES[0];
                const priority = PRIORITY_BADGES[Number(task.priority)] || PRIORITY_BADGES[0];
                return (
                  <tr key={task.id} onClick={() => router.push(`/projects/${projectId}`)}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{task.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {priority.label && <span className={`text-xs px-2 py-1 rounded font-medium ${priority.cls}`}>{priority.label}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0">
                            {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee.firstName} {task.assignee.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
