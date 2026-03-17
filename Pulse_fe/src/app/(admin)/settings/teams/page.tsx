"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { teamService, Team, CreateTeamRequest } from "@/services/teamService";
import { useSlug } from '@/hooks/useSlug';

const TEAM_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
];

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateTeamRequest>({ name: "", description: "", color: TEAM_COLORS[0] });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const slug = useSlug();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const t = await teamService.getAll(slug);
      setTeams(t);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await teamService.create(slug, form);
      setShowCreate(false);
      setForm({ name: "", description: "", color: TEAM_COLORS[0] });
      await fetchData();
    } catch { /* ignore */ }
    finally { setCreating(false); }
  };

  const handleDelete = async (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === teamId) {
      setDeleting(true);
      try {
        await teamService.deleteTeam(slug, teamId);
        setConfirmDeleteId(null);
        await fetchData();
      } catch { /* ignore */ }
      finally { setDeleting(false); }
    } else {
      setConfirmDeleteId(teamId);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Organize members into teams</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Team
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : teams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10">
              <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">No teams yet</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Create your first team to organize your workspace members.</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors">Create Team</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Team</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Description</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Members</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Created</th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {teams.map((team) => (
                <tr key={team.id} onClick={() => router.push(`/settings/teams/${team.id}`)}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: team.color || "#6366f1" }}>
                        {team.name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{team.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-[300px]">
                      {team.description ? (team.description.length > 300 ? team.description.slice(0, 300) + "…" : team.description) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {team.members.slice(0, 4).map((m) => (
                        <div key={m.id} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 ring-2 ring-white dark:ring-gray-900 -ml-1 first:ml-0 shrink-0">
                          {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                        </div>
                      ))}
                      {team.memberCount > 4 && <span className="text-xs text-gray-400 ml-1.5">+{team.memberCount - 4}</span>}
                      {team.memberCount === 0 && <span className="text-xs text-gray-400">No members</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(team.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {confirmDeleteId === team.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={(e) => handleDelete(e, team.id)} disabled={deleting}
                          className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors flex items-center gap-1">
                          {deleting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Delete"}
                        </button>
                        <button onClick={cancelDelete} className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => handleDelete(e, team.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete team">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Team</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Engineering"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {TEAM_COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-brand-500 dark:ring-offset-gray-900 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
