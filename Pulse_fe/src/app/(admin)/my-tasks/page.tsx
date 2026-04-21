"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { projectService, Project } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { Task, BoardColumn } from "@/types/task";
import Select from "@/components/form/Select";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSlug } from '@/hooks/useSlug';

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

interface GroupedTasks { project: Project; tasks: Task[]; }

export default function MyTasksPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<GroupedTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const slug = useSlug();

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await projectService.getAll(slug);
      const results: GroupedTasks[] = [];

      for (const proj of projects) {
        const boards = await taskService.getBoardView(slug, proj.id).catch(() => [] as BoardColumn[]);
        const myTasks = boards.flatMap((col) =>
          col.tasks.filter((t) => t.assignees?.some((a) => a.id === user?.id))
        );
        if (statusFilter) {
          const filtered = myTasks.filter((t) => String(t.status) === statusFilter);
          if (filtered.length > 0) results.push({ project: proj, tasks: filtered });
        } else {
          if (myTasks.length > 0) results.push({ project: proj, tasks: myTasks });
        }
      }
      setGroups(results);
    } catch {}
    setLoading(false);
  }, [slug, user?.id, statusFilter]);

  useEffect(() => { fetchMyTasks(); }, [fetchMyTasks]);

  const totalTasks = groups.reduce((s, g) => s + g.tasks.length, 0);

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Loading..." : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} assigned to you`}
          </p>
        </div>
        <Select 
          value={statusFilter} 
          onChange={setStatusFilter} 
          className="w-40 shrink-0" 
          placeholder="All Statuses"
          options={[
            {value: "0", label: "To Do"},
            {value: "1", label: "In Progress"},
            {value: "2", label: "In Review"},
            {value: "3", label: "Done"}
          ]}
        />
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No tasks assigned to you</p>
          <p className="text-xs text-gray-500 mt-1">Tasks will appear here when assigned</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.project.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
              {/* Project header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: group.project.color || "#6366f1" }}>
                  {group.project.icon || group.project.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{group.project.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}</span>
              </div>
              {/* Task rows */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {group.tasks.map((task) => {
                  const status = STATUS_BADGES[Number(task.status)] || STATUS_BADGES[0];
                  const priority = PRIORITY_BADGES[Number(task.priority)] || PRIORITY_BADGES[0];
                  return (
                    <div key={task.id} onClick={() => router.push(`/projects/${group.project.id}`)}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">{task.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${status.cls}`}>{status.label}</span>
                      {priority.label && <span className={`text-xs px-2 py-1 rounded font-medium shrink-0 ${priority.cls}`}>{priority.label}</span>}
                      <span className="text-xs text-gray-400 shrink-0 w-20 text-right">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
