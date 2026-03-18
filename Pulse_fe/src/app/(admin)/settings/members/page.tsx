"use client";
import React, { useEffect, useState, useCallback } from "react";
import { roleService } from "@/services/roleService";
import { workspaceService } from "@/services/workspaceService";
import { WorkspaceMember, Role } from "@/types/roles";
import { useSlug } from '@/hooks/useSlug';
import { useAuthStore } from "@/stores/useAuthStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export default function MembersPage() {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<WorkspaceMember | null>(null);
  const slug = useSlug();
  const currentUser = useAuthStore((s) => s.user);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [m, r] = await Promise.all([
        roleService.getMembers(slug),
        roleService.getRoles(slug),
      ]);
      setMembers(m);
      setRoles(r);
      if (r.length > 0 && !inviteRoleId) setInviteRoleId(r.find(role => role.name === "Staff")?.id || r[0].id);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteRoleId) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");
    try {
      await workspaceService.inviteMember(slug, { email: inviteEmail, roleId: inviteRoleId });
      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setTimeout(() => { setShowInvite(false); setInviteSuccess(""); }, 2000);
    } catch {
      setInviteError("Failed to send invitation. Please try again.");
    }
    finally { setInviting(false); }
  };

  const handleRemove = async () => {
    if (!confirmRemove) return;
    setRemovingId(confirmRemove.userId);
    try {
      await workspaceService.removeMember(slug, confirmRemove.userId);
      setMembers((prev) => prev.filter((m) => m.userId !== confirmRemove.userId));
      setConfirmRemove(null);
    } catch { /* ignore */ }
    finally { setRemovingId(null); }
  };

  const isOwner = currentWorkspace?.isOwner;

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage workspace members and their roles
          </p>
        </div>
        <button onClick={() => { setShowInvite(true); setInviteError(""); setInviteSuccess(""); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Invite Member
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No members found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Member</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Joined</th>
                {isOwner && <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {members.map((member) => {
                const isSelf = member.userId === currentUser?.id;
                return (
                  <tr key={member.userId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-brand-500">
                          {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.firstName} {member.lastName}
                            {isSelf && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium">You</span>}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium">
                        {member.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(member.assignedAt).toLocaleDateString()}
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setConfirmRemove(member)}
                            disabled={removingId === member.userId}
                            className="text-xs text-red-400 hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Member</h2>
              <button onClick={() => setShowInvite(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}{role.description ? ` — ${role.description}` : ""}</option>
                  ))}
                </select>
              </div>
              {inviteSuccess && <p className="text-sm text-green-500 flex items-center gap-1"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>{inviteSuccess}</p>}
              {inviteError && <p className="text-sm text-red-500">{inviteError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowInvite(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {inviting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Dialog */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmRemove(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Remove Member</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to remove <strong>{confirmRemove.firstName} {confirmRemove.lastName}</strong> from this workspace?
            </p>
            <div className="flex gap-3">
              <button onClick={handleRemove} disabled={removingId !== null}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 transition-colors">
                {removingId ? "Removing..." : "Remove"}
              </button>
              <button onClick={() => setConfirmRemove(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
