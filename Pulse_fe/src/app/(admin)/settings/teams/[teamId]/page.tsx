"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { teamService, Team, TeamMemberInfo } from "@/services/teamService";
import { roleService } from "@/services/roleService";
import { WorkspaceMember } from "@/types/roles";

const ROLE_OPTIONS = ["lead", "member", "viewer"];

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const slug = "pulse-demo";

  const [team, setTeam] = useState<Team | null>(null);
  const [allMembers, setAllMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [t, m] = await Promise.all([
        teamService.getById(slug, teamId),
        roleService.getMembers(slug),
      ]);
      setTeam(t);
      setAllMembers(m);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, teamId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const availableMembers = allMembers.filter(
    (m) => !team?.members.some((tm) => tm.id === m.userId)
  );

  const handleAddMember = async (userId: string) => {
    setAdding(true);
    setMsg(null);
    try {
      await teamService.addMember(slug, teamId, { userId });
      setAddEmail("");
      setMsg({ type: "success", text: "Member added" });
      await fetchData();
    } catch {
      setMsg({ type: "error", text: "Failed to add member" });
    }
    finally { setAdding(false); }
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirmRemoveId === userId) {
      try {
        await teamService.removeMember(slug, teamId, userId);
        setConfirmRemoveId(null);
        await fetchData();
      } catch { /* ignore */ }
    } else {
      setConfirmRemoveId(userId);
    }
  };

  const handleDeleteTeam = async () => {
    if (confirmDeleteTeam) {
      setDeleting(true);
      try {
        await teamService.deleteTeam(slug, teamId);
        router.push("/settings/teams");
      } catch { /* ignore */ }
      finally { setDeleting(false); }
    } else {
      setConfirmDeleteTeam(true);
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center min-h-[60vh] items-center">
      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!team) return (
    <div className="p-6 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">Team not found</h2>
      <button onClick={() => router.push("/settings/teams")} className="mt-3 text-sm text-brand-500 hover:underline">← Back to teams</button>
    </div>
  );

  const filteredAvailable = addEmail.trim()
    ? availableMembers.filter((m) => {
        const search = addEmail.toLowerCase();
        return (
          m.email?.toLowerCase().includes(search) ||
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(search)
        );
      })
    : availableMembers;

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/settings/teams")} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: team.color || "#6366f1" }}>
            {team.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{team.description || "No description"} · {team.memberCount} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmDeleteTeam && (
            <button onClick={() => setConfirmDeleteTeam(false)} className="px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
          )}
          <button onClick={handleDeleteTeam} disabled={deleting}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${confirmDeleteTeam ? "text-white bg-red-500 hover:bg-red-600" : "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"}`}>
            {deleting ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            )}
            {confirmDeleteTeam ? "Confirm Delete" : "Delete Team"}
          </button>
        </div>
      </div>

      {/* Add Member Card */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Add Member</h2>
        <div className="relative">
          <input type="text" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="Search workspace members by name or email..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          {addEmail.trim() && filteredAvailable.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredAvailable.map((m) => (
                <button key={m.userId} onClick={() => { handleAddMember(m.userId); setAddEmail(""); }}
                  disabled={adding}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <span className="text-xs text-brand-500 font-medium shrink-0">+ Add</span>
                </button>
              ))}
            </div>
          )}
          {addEmail.trim() && filteredAvailable.length === 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
              <p className="text-sm text-gray-400">No matching workspace members found</p>
            </div>
          )}
        </div>
        {msg && (
          <div className={`mt-3 flex items-center gap-2 text-sm ${msg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {msg.type === "success" 
              ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            }
            {msg.text}
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Members ({team.memberCount})</h2>
        </div>

        {team.members.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">No members in this team. Use the search above to add members.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {team.members.map((member: TeamMemberInfo) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{member.firstName} {member.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{member.email || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                      member.role === "lead"
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        : member.role === "viewer"
                        ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    }`}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                        member.role === "lead"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                          : member.role === "viewer"
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      }`}>
                        {member.role === "lead" ? (
                          <><svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> Lead</>
                        ) : member.role === "viewer" ? (
                          <><svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Viewer</>
                        ) : "Member"}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {confirmRemoveId === member.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleRemoveMember(member.id)}
                          className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">Remove</button>
                        <button onClick={() => setConfirmRemoveId(null)}
                          className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleRemoveMember(member.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Remove member">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
