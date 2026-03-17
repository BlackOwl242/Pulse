"use client";
import React, { useEffect, useState } from "react";
import { projectService, Project } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { roleService } from "@/services/roleService";
import api from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { BoardColumn } from "@/types/task";
import Link from "next/link";
import { useSlug } from '@/hooks/useSlug';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [meetings, setMeetings] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);

  const slug = useSlug();

  useEffect(() => {
    async function load() {
      if (!slug) { setLoading(false); return; }
      try {
        const [projs, members] = await Promise.all([
          projectService.getAll(slug).catch(() => []),
          roleService.getMembers(slug).catch(() => []),
        ]);
        setProjects(projs);
        setMemberCount(members.length);

        // Fetch board data for task status distribution
        if (projs.length > 0) {
          const boards = await Promise.all(
            projs.slice(0, 5).map((p: Project) =>
              taskService.getBoardView(slug, p.id).catch(() => [] as BoardColumn[])
            )
          );
          const counts: Record<string, number> = {};
          const allTasks: any[] = [];
          boards.flat().forEach((col) => {
            counts[col.name] = (counts[col.name] || 0) + col.tasks.length;
            allTasks.push(...col.tasks.map(t => ({ ...t, statusName: col.name })));
          });
          setStatusCounts(counts);
          // Get user's assigned tasks (InProgress / Todo)
          const userId = user?.id;
          if (userId) {
            const mine = allTasks.filter(t => t.assignees?.some((a: any) => a.id === userId) && t.statusName !== "Done");
            setMyTasks(mine.slice(0, 5));
          }
        }

        // Fetch upcoming meetings, chat channels, objectives
        const [mtgs, chnls, objs] = await Promise.all([
          api.get(`/workspaces/${slug}/meetings`).then(r => r.data).catch(() => []),
          api.get(`/workspaces/${slug}/chat/channels`).then(r => r.data).catch(() => []),
          api.get(`/workspaces/${slug}/objectives`).then(r => r.data).catch(() => []),
        ]);
        setMeetings(mtgs.slice(0, 3));
        setChannels(chnls.slice(0, 3));
        setObjectives(objs.slice(0, 3));
      } catch {}
      setLoading(false);
    }
    load();
  }, [slug, user?.id]);

  const totalTasks = projects.reduce((s, p) => s + p.taskCount, 0);
  const completedTasks = projects.reduce((s, p) => s + p.completedTaskCount, 0);
  const activeTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const firstName = user?.firstName || "User";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/projects" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Project
          </Link>
          <Link href="/meetings" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m0 0V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-.75M21 11.25H3" /></svg>
            Schedule Meeting
          </Link>
          <Link href="/planner" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Plan My Day
          </Link>
          <Link href="/ai" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" /></svg>
            Ask AI
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/projects" className="group">
          <MetricCard title="Total Projects" value={loading ? "—" : String(projects.length)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>} color="brand" />
        </Link>
        <Link href="/my-tasks" className="group">
          <MetricCard title="Active Tasks" value={loading ? "—" : String(activeTasks)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>} color="blue" />
        </Link>
        <Link href="/settings/members" className="group">
          <MetricCard title="Team Members" value={loading ? "—" : String(memberCount)} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} color="green" />
        </Link>
        <Link href="/reports" className="group">
          <MetricCard title="Completed" value={loading ? "—" : `${completedTasks} (${completionRate}%)`} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="purple" />
        </Link>
      </div>

      {/* Main Grid: My Tasks + Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Assigned Tasks */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">My Tasks</h2>
              {myTasks.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium">{myTasks.length}</span>}
            </div>
            <Link href="/my-tasks" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">View all</Link>
          </div>
          {loading ? <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
          : myTasks.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No tasks assigned to you</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {myTasks.map((t: any) => (
                <Link key={t.id} href={`/projects/${t.projectId || ''}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.statusName === 'InProgress' ? 'bg-blue-500' : t.statusName === 'InReview' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{t.title}</p>
                    {t.deadline && <p className="text-[10px] text-gray-400">{new Date(t.deadline).toLocaleDateString()}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.statusName === 'InProgress' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : t.statusName === 'InReview' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {t.statusName === 'InProgress' ? 'In Progress' : t.statusName === 'InReview' ? 'In Review' : 'To Do'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
              {meetings.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-medium">{meetings.length}</span>}
            </div>
            <Link href="/meetings" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">View all</Link>
          </div>
          {meetings.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No upcoming meetings</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {meetings.map((m: any) => (
                <Link key={m.id} href="/meetings" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{m.title}</p>
                    <p className="text-[10px] text-gray-400">{new Date(m.proposedStartTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 font-medium">
                    {m.participants?.length || 0} people
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Second Row: OKR + Chat + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* OKR Progress */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">OKR Progress</h2>
            </div>
            <Link href="/objectives" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">View all</Link>
          </div>
          {objectives.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No objectives yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {objectives.map((o: any) => (
                <Link key={o.id} href="/objectives" className="block px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{o.title}</p>
                    <span className="text-xs font-medium text-gray-500 ml-2">{Math.round(o.progress || 0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${o.progress || 0}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Chat */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <Link href="/chat" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">Open chat</Link>
          </div>
          {channels.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {channels.map((c: any) => (
                <Link key={c.id} href="/chat" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 text-xs font-bold">
                    #
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.name || "Direct"}</p>
                    <p className="text-[10px] text-gray-400">{c.memberCount || 0} members</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">{c.unreadCount}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Task Distribution Chart */}
        {!loading && totalTasks > 0 ? (
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
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Links</h2>
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: "Calendar", href: "/calendar", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m0 0V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-.75M21 11.25H3" /></svg> },
                { label: "Planner", href: "/planner", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                { label: "Reports", href: "/reports", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
                { label: "AI Assistant", href: "/ai", icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg> },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                  {item.icon}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects + Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projects Summary */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Projects</h2>
            <Link href="/projects" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium">View all</Link>
          </div>
          {loading ? (
            <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {projects.slice(0, 4).map((project) => {
                const progress = project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0;
                return (
                  <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: project.color || "#6366f1" }}>
                      {project.icon || project.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{project.name}</p>
                      <p className="text-[10px] text-gray-400">{project.completedTaskCount}/{project.taskCount} tasks</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color || "#6366f1" }} />
                      </div>
                      <span className="text-[10px] text-gray-400 w-7 text-right">{progress}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <ActivityCard slug={slug} />
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: "brand" | "blue" | "green" | "purple" }) {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] group-hover:border-brand-200 dark:group-hover:border-brand-500/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white/90">{value}</p>
        </div>
      </div>
    </div>
  );
}

const STATUS_DISPLAY = [
  { key: "Todo", label: "To Do", color: "#9ca3af", dot: "bg-gray-400" },
  { key: "InProgress", label: "In Progress", color: "#3b82f6", dot: "bg-blue-500" },
  { key: "InReview", label: "In Review", color: "#f59e0b", dot: "bg-amber-500" },
  { key: "Done", label: "Done", color: "#22c55e", dot: "bg-green-500" },
  { key: "Cancelled", label: "Cancelled", color: "#ef4444", dot: "bg-red-400" },
];

function DonutChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  let angle = 0;
  const segments: string[] = [];
  STATUS_DISPLAY.forEach((s) => { const c = counts[s.key] || 0; if (c === 0) return; const d = (c / total) * 360; segments.push(`${s.color} ${angle}deg ${angle + d}deg`); angle += d; });
  const gradient = segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#e5e7eb 0deg 360deg)";
  return (
    <div className="relative w-24 h-24 shrink-0">
      <div className="w-full h-full rounded-full" style={{ background: gradient }} />
      <div className="absolute inset-3 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center"><p className="text-base font-bold text-gray-900 dark:text-white">{total}</p><p className="text-[9px] text-gray-400">tasks</p></div>
      </div>
    </div>
  );
}

interface Activity { id: string; action: string; description: string; entityType: string; createdAt: string; actor: { id: string; firstName: string; lastName: string } }

function ActivityCard({ slug }: { slug: string }) {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { if (!slug) { setLoading(false); return; } api.get(`/workspaces/${slug}/activity`, { params: { limit: 8 } }).then((r) => setActivities(r.data)).catch(() => {}).finally(() => setLoading(false)); }, [slug]);
  const timeAgo = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return "now"; if (m < 60) return `${m}m`; const h = Math.floor(m / 60); if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`; };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"><h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h2></div>
      {loading ? <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      : activities.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">No recent activity</div>
      : (
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-6 py-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0 mt-0.5">{a.actor?.firstName?.charAt(0)}{a.actor?.lastName?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1"><span className="font-medium text-gray-900 dark:text-white">{a.actor?.firstName} {a.actor?.lastName}</span> {a.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
