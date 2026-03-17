"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { workspaceService } from "@/services/workspaceService";
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

export default function MyWorkspacesPage() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces, addWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWorkspaces().finally(() => setLoading(false));
  }, [fetchWorkspaces]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const ws = await workspaceService.create({ name: newName.trim(), description: newDesc.trim() || undefined });
      addWorkspace(ws);
      setCurrentWorkspace(ws);
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      fetchWorkspaces();
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const handleSwitch = (ws: Workspace) => {
    setCurrentWorkspace(ws);
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Workspaces</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            All workspaces you&apos;ve joined or created. Switch between them or create new ones.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Workspace
        </button>
      </div>

      {/* Create workspace form */}
      {showCreate && (
        <div className="mb-6 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">New Workspace</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workspace name"
              autoFocus
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating..." : "Create Workspace"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
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
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Created</th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
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
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold shrink-0 ${
                          isCurrent ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }`}>
                          {ws.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ws.name}</p>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-medium">
                                Current
                              </span>
                            )}
                            {ws.isOwner && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-medium">
                                Owner
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">{ws.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                        ROLE_COLORS[ws.roleName || ""] || ROLE_COLORS.Guest
                      }`}>
                        {ws.roleName || "Member"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{ws.memberCount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${
                        PLAN_BADGES[ws.plan] || PLAN_BADGES.free
                      }`}>
                        {ws.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-400">
                        {new Date(ws.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!isCurrent ? (
                        <button
                          onClick={() => handleSwitch(ws)}
                          className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
