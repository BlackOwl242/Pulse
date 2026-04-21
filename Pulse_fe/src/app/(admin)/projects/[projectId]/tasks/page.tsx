"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { projectService, Project } from "@/services/projectService";
import { roleService } from "@/services/roleService";
import { Task } from "@/types/task";
import { WorkspaceMember } from "@/types/roles";
import { useSlug } from '@/hooks/useSlug';
import Select from "@/components/form/Select";

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

const STATUS_COLORS: Record<number, string> = {
  0: "#9ca3af", 1: "#3b82f6", 2: "#f59e0b", 3: "#22c55e", 4: "#ef4444",
};

type ViewMode = "list" | "timeline";

/* ──── Gantt helpers ──── */
function daysBetween(a: Date, b: Date) { return Math.ceil((b.getTime() - a.getTime()) / 86400000); }

function GanttChart({ tasks }: { tasks: Task[] }) {
  const ganttTasks = tasks.filter(t => t.startDate || t.deadline);
  if (ganttTasks.length === 0) return (
    <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
      No tasks with dates. Set start date or deadline on tasks to see the timeline.
    </div>
  );

  const allDates = ganttTasks.flatMap(t => [t.startDate, t.deadline].filter(Boolean) as string[]).map(d => new Date(d));
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  // Pad 2 days each side
  minDate.setDate(minDate.getDate() - 2);
  maxDate.setDate(maxDate.getDate() + 2);
  const totalDays = daysBetween(minDate, maxDate) || 1;

  // Generate day headers (show every Nth day depending on range)
  const dayHeaders: { label: string; isWeekend: boolean }[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const d = new Date(minDate);
    d.setDate(d.getDate() + i);
    dayHeaders.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, isWeekend: d.getDay() === 0 || d.getDay() === 6 });
  }
  const showEvery = totalDays > 30 ? 7 : totalDays > 14 ? 3 : 1;

  const today = new Date();
  const todayOffset = daysBetween(minDate, today);
  const todayPct = (todayOffset / totalDays) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day header row */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <div className="w-52 shrink-0 px-4 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">Task</div>
          <div className="flex-1 relative flex">
            {dayHeaders.map((d, i) => (
              <div key={i} className={`flex-1 min-w-[24px] text-center text-[9px] py-1.5 ${d.isWeekend ? 'bg-gray-50 dark:bg-gray-800/30' : ''} ${i % showEvery === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-transparent'}`}>
                {i % showEvery === 0 ? d.label : '.'}
              </div>
            ))}
          </div>
        </div>
        {/* Task rows */}
        {ganttTasks.map((task) => {
          const start = task.startDate ? new Date(task.startDate) : task.deadline ? new Date(task.deadline) : minDate;
          const end = task.deadline ? new Date(task.deadline) : task.startDate ? new Date(new Date(task.startDate).getTime() + 86400000 * 3) : maxDate;
          const leftPct = (daysBetween(minDate, start) / totalDays) * 100;
          const widthPct = Math.max(((daysBetween(start, end) || 1) / totalDays) * 100, 2);
          const statusNum = Number(task.status) || 0;
          const color = STATUS_COLORS[statusNum] || "#6366f1";

          return (
            <div key={task.id} className="flex items-center border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
              <div className="w-52 shrink-0 px-4 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-800 dark:text-gray-200 truncate font-medium">{task.title}</span>
              </div>
              <div className="flex-1 relative h-8">
                {/* Weekend stripes */}
                {dayHeaders.map((d, i) => d.isWeekend ? (
                  <div key={i} className="absolute top-0 bottom-0 bg-gray-50/50 dark:bg-gray-800/20" style={{ left: `${(i / totalDays) * 100}%`, width: `${100 / totalDays}%` }} />
                ) : null)}
                {/* Today line */}
                {todayPct >= 0 && todayPct <= 100 && (
                  <div className="absolute top-0 bottom-0 w-px bg-red-400 z-10" style={{ left: `${todayPct}%` }} />
                )}
                {/* Bar */}
                <div
                  className="absolute top-1.5 h-5 rounded-md opacity-80 group-hover:opacity-100 transition-opacity cursor-default"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: color }}
                  title={`${task.title}\n${task.startDate ? `Start: ${new Date(task.startDate).toLocaleDateString()}` : ''}\n${task.deadline ? `Due: ${new Date(task.deadline).toLocaleDateString()}` : ''}`}
                >
                  <span className="text-[9px] text-white font-medium px-1.5 truncate block leading-5">{task.title}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TaskListPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const slug = useSlug();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const fetchTasks = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
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

        {/* View Toggle */}
        <div className="ml-auto flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          <button onClick={() => router.push(`/projects/${projectId}`)}
            className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md transition-colors">
            Board
          </button>
          <button onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'list' ? 'text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            List
          </button>
          <button onClick={() => setViewMode("timeline")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'timeline' ? 'text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            Timeline
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" />
        </div>
        <Select 
          value={statusFilter} 
          onChange={setStatusFilter} 
          className="w-40 shrink-0" 
          placeholder="All Statuses"
          options={STATUS_OPTIONS.filter(o => o.value !== "")}
        />
        <Select 
          value={priorityFilter} 
          onChange={setPriorityFilter} 
          className="w-40 shrink-0" 
          placeholder="All Priorities"
          options={PRIORITY_OPTIONS.filter(o => o.value !== "")}
        />
        <Select 
          value={assigneeFilter} 
          onChange={setAssigneeFilter} 
          className="w-48 shrink-0" 
          placeholder="All Assignees"
          options={members.map(m => ({ value: m.userId, label: `${m.firstName} ${m.lastName}` }))}
        />
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tasks found</p>
          </div>
        ) : viewMode === "timeline" ? (
          <GanttChart tasks={tasks} />
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
                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div className="flex -space-x-1.5">
                            {task.assignees.slice(0, 3).map((a) => (
                              <div key={a.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0" title={`${a.firstName} ${a.lastName}`}>
                                {a.avatarUrl ? (
                                  <img src={a.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  `${a.firstName?.charAt(0)}${a.lastName?.charAt(0)}`
                                )}
                              </div>
                            ))}
                            {task.assignees.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-700 bg-gray-100 shrink-0" title={`+${task.assignees.length - 3} more`}>
                                +{task.assignees.length - 3}
                              </div>
                            )}
                          </div>
                          {task.assignees.length === 1 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{task.assignees[0].firstName} {task.assignees[0].lastName}</span>
                          )}
                          {task.assignees.length > 1 && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{task.assignees.length} assignees</span>
                          )}
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
