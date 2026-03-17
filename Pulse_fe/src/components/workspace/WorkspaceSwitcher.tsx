"use client";
import { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { workspaceService } from "@/services/workspaceService";
import { Workspace } from "@/types/workspace";

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Manager: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  Staff: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  Guest: "bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400",
};

interface Props {
  collapsed: boolean;
}

export default function WorkspaceSwitcher({ collapsed }: Props) {
  const { workspaces, currentWorkspace, setCurrentWorkspace, fetchWorkspaces, addWorkspace } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitch = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const ws = await workspaceService.create({ name: newName.trim(), description: newDesc.trim() || undefined });
      addWorkspace(ws);
      setCurrentWorkspace(ws);
      setNewName("");
      setNewDesc("");
      setCreating(false);
      setOpen(false);
      // Refetch to get the role info for the new workspace
      fetchWorkspaces();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const initial = currentWorkspace?.name?.charAt(0)?.toUpperCase() || "W";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-1 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500 text-white font-bold text-sm shrink-0">
          {initial}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentWorkspace?.name || "Select workspace"}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {currentWorkspace?.roleName || "No workspace"}
              </p>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute left-0 top-full mt-1 ${collapsed ? "w-72 left-12" : "w-full"} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[100] overflow-hidden`}>
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Workspaces</p>
          </div>

          {/* Workspace list */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => handleSwitch(ws)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors ${
                  ws.id === currentWorkspace?.id
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shrink-0 ${
                  ws.id === currentWorkspace?.id
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}>
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    ws.id === currentWorkspace?.id
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}>
                    {ws.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                      ROLE_COLORS[ws.roleName || ""] || ROLE_COLORS.Guest
                    }`}>
                      {ws.roleName || "Member"}
                    </span>
                    <span className="text-[10px] text-gray-400">{ws.memberCount} members</span>
                  </div>
                </div>
                {ws.id === currentWorkspace?.id && (
                  <svg className="w-4 h-4 text-brand-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Create workspace section */}
          <div className="border-t border-gray-100 dark:border-gray-800">
            {creating ? (
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Workspace name"
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    disabled={saving || !newName.trim()}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Creating..." : "Create"}
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewName(""); setNewDesc(""); }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create workspace
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
