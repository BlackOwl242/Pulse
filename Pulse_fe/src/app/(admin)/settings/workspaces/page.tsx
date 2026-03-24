"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { workspaceService } from "@/services/workspaceService";
import { roleService } from "@/services/roleService";
import { Workspace } from "@/types/workspace";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Manager: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Staff: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Guest: "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

const PLAN_BADGES: Record<string, string> = {
  free: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  pro: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  enterprise: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
};

interface MyInvitation {
  id: string;
  workspaceName: string;
  workspaceSlug: string;
  roleName: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

interface MemberInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
}

export default function MyWorkspacesPage() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces } = useWorkspaceStore();
  const currentUser = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Invitations
  const [invitations, setInvitations] = useState<MyInvitation[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Confirm dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "leave" | "delete";
    ws: Workspace;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Transfer dialog
  const [transferDialog, setTransferDialog] = useState<{
    ws: Workspace;
    members: MemberInfo[];
    selectedId: string;
  } | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWorkspaces();
      const inv = await workspaceService.getMyInvitations().catch(() => []);
      setInvitations(inv);
    } catch { /* ignore */ }
    setLoading(false);
  }, [fetchWorkspaces]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Listen for workspace-updated events
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener("workspace-updated", handler);
    return () => window.removeEventListener("workspace-updated", handler);
  }, [fetchAll]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const ws = await workspaceService.create({ name: newName.trim(), description: newDesc.trim() || undefined });
      setCurrentWorkspace(ws);
      setNewName(""); setNewDesc(""); setShowCreate(false);
      fetchAll();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleSwitch = (ws: Workspace) => setCurrentWorkspace(ws);

  const handleAcceptInvitation = async (id: string) => {
    setAcceptingId(id);
    try {
      await workspaceService.acceptInvitation(id);
      fetchAll();
    } catch { /* ignore */ } finally { setAcceptingId(null); }
  };

  const handleDeclineInvitation = async (id: string) => {
    setAcceptingId(id);
    try {
      await workspaceService.declineInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    } catch { /* ignore */ } finally { setAcceptingId(null); }
  };

  const handleLeave = async () => {
    if (!confirmDialog || confirmDialog.type !== "leave") return;
    setActionLoading(true);
    try {
      await workspaceService.leaveWorkspace(confirmDialog.ws.slug);
      if (currentWorkspace?.id === confirmDialog.ws.id) {
        setCurrentWorkspace(null);
      }
      setConfirmDialog(null);
      fetchAll();
    } catch { /* ignore */ } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirmDialog || confirmDialog.type !== "delete") return;
    setActionLoading(true);
    try {
      await workspaceService.deleteWorkspace(confirmDialog.ws.slug);
      if (currentWorkspace?.id === confirmDialog.ws.id) {
        setCurrentWorkspace(null);
      }
      setConfirmDialog(null);
      fetchAll();
    } catch { /* ignore */ } finally { setActionLoading(false); }
  };

  const openTransferDialog = async (ws: Workspace) => {
    try {
      const members = await roleService.getMembers(ws.slug);
      const filtered = members.filter((m: MemberInfo) => m.userId && m.userId !== currentUser?.id);
      if (filtered.length === 0) {
        alert("No other members to transfer ownership to. Invite members first.");
        return;
      }
      setTransferDialog({ ws, members: filtered, selectedId: filtered[0]?.userId || "" });
    } catch { /* ignore */ }
  };

  const handleTransfer = async () => {
    if (!transferDialog || !transferDialog.selectedId) return;
    setTransferLoading(true);
    try {
      await workspaceService.transferOwnership(transferDialog.ws.slug, transferDialog.selectedId);
      setTransferDialog(null);
      fetchAll();
    } catch { /* ignore */ } finally { setTransferLoading(false); }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Workspaces</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your workspaces, invitations, and membership.
          </p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Workspace
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">New Workspace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Workspace name" autoFocus
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving || !newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors">
              {saving ? "Creating..." : "Create"}
            </button>
            <button onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pending Invitations ({invitations.length})</h3>
          </div>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white dark:bg-gray-900/50 border border-amber-100 dark:border-amber-800/30">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.workspaceName}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Invited by {inv.invitedBy} · Role: <span className="font-medium">{inv.roleName}</span> · Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleAcceptInvitation(inv.id)} disabled={acceptingId === inv.id}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors">
                    {acceptingId === inv.id ? "..." : "Accept"}
                  </button>
                  <button onClick={() => handleDeclineInvitation(inv.id)} disabled={acceptingId === inv.id}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspaces table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-white/[0.03]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Workspace</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Your Role</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Members</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <p className="text-sm text-gray-400">No workspaces yet. Create your first one!</p>
                </td>
              </tr>
            ) : (
              workspaces.map((ws) => {
                const isCurrent = ws.id === currentWorkspace?.id;
                return (
                  <tr key={ws.id} className={`transition-colors ${isCurrent ? "bg-brand-50/30 dark:bg-brand-500/5" : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 ${isCurrent ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
                          {ws.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ws.name}</p>
                            {isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-medium">Current</span>}
                            {ws.isOwner && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-medium">Owner</span>}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{ws.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${ROLE_COLORS[ws.roleName || ""] || ROLE_COLORS.Guest}`}>
                        {ws.roleName || "Member"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{ws.memberCount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${PLAN_BADGES[ws.plan] || PLAN_BADGES.free}`}>
                        {ws.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isCurrent && (
                          <button onClick={() => handleSwitch(ws)}
                            className="px-2.5 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors">
                            Switch
                          </button>
                        )}
                        {ws.isOwner && (
                          <button onClick={() => openTransferDialog(ws)}
                            className="px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Transfer ownership">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                          </button>
                        )}
                        {ws.isOwner ? (
                          <button onClick={() => setConfirmDialog({ type: "delete", ws })}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete workspace">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        ) : (
                          <button onClick={() => setConfirmDialog({ type: "leave", ws })}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Leave workspace">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog (Leave / Delete) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget && !actionLoading) setConfirmDialog(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${confirmDialog.type === "delete" ? "bg-red-50 dark:bg-red-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
                <svg className={`w-5 h-5 ${confirmDialog.type === "delete" ? "text-red-500" : "text-amber-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {confirmDialog.type === "delete" ? "Delete Workspace" : "Leave Workspace"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {confirmDialog.type === "delete"
                    ? `This will permanently delete "${confirmDialog.ws.name}" and all its data.`
                    : `You will lose access to "${confirmDialog.ws.name}".`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmDialog.type === "delete" ? handleDelete : handleLeave} disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 transition-colors">
                {actionLoading ? "Processing..." : confirmDialog.type === "delete" ? "Delete" : "Leave"}
              </button>
              <button onClick={() => setConfirmDialog(null)} disabled={actionLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Dialog */}
      {transferDialog && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget && !transferLoading) setTransferDialog(null); }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Transfer Ownership</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose the new owner of &quot;{transferDialog.ws.name}&quot;</p>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {transferDialog.members.map((m) => (
                <label
                  key={m.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${transferDialog.selectedId === m.userId
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500/50"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                >
                  <input
                    type="radio"
                    name="transfer-target"
                    value={m.userId}
                    checked={transferDialog.selectedId === m.userId}
                    onChange={() => setTransferDialog({ ...transferDialog, selectedId: m.userId })}
                    className="accent-brand-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {m.firstName} {m.lastName}
                      <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.roleName] || ROLE_COLORS.Guest}`}>{m.roleName}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleTransfer} disabled={transferLoading || !transferDialog.selectedId}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors">
                {transferLoading ? "Transferring..." : "Transfer"}
              </button>
              <button onClick={() => setTransferDialog(null)} disabled={transferLoading}
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
