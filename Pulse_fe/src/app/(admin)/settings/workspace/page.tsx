"use client";
import React, { useEffect, useState, useCallback } from "react";
import { workspaceService, PendingInvitation } from "@/services/workspaceService";
import { roleService } from "@/services/roleService";
import { Role } from "@/types/roles";
import { useSlug } from '@/hooks/useSlug';
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

interface WorkspaceInfo {
  id: string; name: string; slug: string; description?: string; plan?: string; logoUrl?: string;
}

export default function WorkspaceSettingsPage() {
  const [ws, setWs] = useState<WorkspaceInfo | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteMode, setInviteMode] = useState<"invite" | "add">("invite");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Pending invitations
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  const slug = useSlug();

  // Reset local state when workspace changes
  useEffect(() => {
    setWs(null);
    setName("");
    setDescription("");
    setMemberCount(0);
    setRoles([]);
    setInviteRoleId("");
    setInvitations([]);
    setInviteMsg(null);
    setSaved(false);
  }, [slug]);

  const fetchData = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    try {
      setLoading(true);
      const [w, m, r] = await Promise.all([
        workspaceService.getBySlug(slug).catch(() => null),
        roleService.getMembers(slug).catch(() => []),
        roleService.getRoles(slug).catch(() => []),
      ]);
      if (w) { setWs(w); setName(w.name || ""); setDescription(w.description || ""); }
      setMemberCount(m.length);
      setRoles(r);
      if (r.length > 0) {
        setInviteRoleId(r.find((role: Role) => role.name === "Staff")?.id || r[0].id);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug]);

  const fetchInvitations = useCallback(async () => {
    if (!slug) return;
    try {
      setLoadingInvites(true);
      const inv = await workspaceService.getInvitations(slug);
      setInvitations(inv);
    } catch { /* ignore */ }
    finally { setLoadingInvites(false); }
  }, [slug]);

  useEffect(() => { fetchData(); fetchInvitations(); }, [fetchData, fetchInvitations]);

  // Re-fetch invitations when a workspace-updated event fires (e.g. invitation accepted)
  useEffect(() => {
    const handler = () => { fetchData(); fetchInvitations(); };
    window.addEventListener("workspace-updated", handler);
    return () => window.removeEventListener("workspace-updated", handler);
  }, [fetchData, fetchInvitations]);

  const handleSave = async () => {
    if (!ws) return;
    setSaving(true); setSaved(false);
    try {
      await workspaceService.update(slug, { name, description });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { }
    setSaving(false);
  };

  const handleInviteOrAdd = async () => {
    if (!inviteEmail.trim() || !inviteRoleId) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      if (inviteMode === "add") {
        const res = await workspaceService.addMemberByEmail(slug, { email: inviteEmail, roleId: inviteRoleId });
        setInviteMsg({ type: "success", text: res.message || `${inviteEmail} added to workspace` });
        setInviteEmail("");
        fetchData();
      } else {
        await workspaceService.inviteMember(slug, { email: inviteEmail, roleId: inviteRoleId });
        setInviteMsg({ type: "success", text: `Invitation sent to ${inviteEmail}` });
        setInviteEmail("");
        fetchInvitations();
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Something went wrong";
      setInviteMsg({ type: "error", text: msg });
    }
    finally { setInviting(false); }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await workspaceService.revokeInvitation(slug, invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="p-6 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)] max-w-8xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Workspace Settings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage your workspace configuration</p>

      {/* Workspace Info Card */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
            Slug: {ws?.slug}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
            {memberCount} Members
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            Plan: {ws?.plan || "Free"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workspace Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your workspace..."
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleSave} disabled={saving || !(name || '').trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors">
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Changes
          </button>
          {saved && <span className="flex items-center gap-1 text-sm text-green-500 font-medium"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Saved</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
        {/* Invite / Add member Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add People</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Invite via email or add an existing user directly</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 mb-4 w-fit">
            <button onClick={() => setInviteMode("invite")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${inviteMode === "invite" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              Send Invitation
            </button>
            <button onClick={() => setInviteMode("add")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${inviteMode === "add" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              Add Directly
            </button>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            {inviteMode === "invite"
              ? "Send an email invitation. The user will receive a link to join your workspace."
              : "Add an existing Pulse user directly by their email. They will be added immediately."}
          </p>

          <div className="flex flex-wrap gap-3">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@example.com"
              onKeyDown={(e) => e.key === "Enter" && handleInviteOrAdd()}
              className="flex-1 min-w-[200px] px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            
            <div className="relative sm:w-32 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)} 
                className="dropdown-toggle w-full text-left flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-gray-900 dark:text-white"
              >
                <span className="truncate">{roles.find(r => r.id === inviteRoleId)?.name || "Select Role"}</span>
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0 text-gray-500 dark:text-gray-400 ml-2">
                  <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <Dropdown isOpen={isRoleDropdownOpen} onClose={() => setIsRoleDropdownOpen(false)} className="w-full mt-1 p-1 max-h-60 overflow-y-auto custom-scrollbar">
                {roles.map((role) => (
                  <button 
                    key={role.id} 
                    type="button" 
                    onClick={() => { setInviteRoleId(role.id); setIsRoleDropdownOpen(false); }} 
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${inviteRoleId === role.id ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {role.name}
                  </button>
                ))}
              </Dropdown>
            </div>

            <button onClick={handleInviteOrAdd} disabled={inviting || !inviteEmail.trim()}
              className="px-5 py-2.5 shrink-0 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
              {inviting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {inviteMode === "invite" ? "Send Invite" : "Add Member"}
            </button>
          </div>

          {inviteMsg && (
            <div className={`mt-3 flex items-center gap-2 text-sm ${inviteMsg.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {inviteMsg.type === "success" ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              )}
              {inviteMsg.text}
            </div>
          )}
        </div>

        {/* Pending Invitations Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden h-full flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Pending Invitations</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">{invitations.length} pending</p>
            </div>
          </div>

          {loadingInvites ? (
            <div className="p-6 flex justify-center">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">No pending invitations</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
                    {inv.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      as <span className="font-medium text-gray-500 dark:text-gray-400">{inv.roleName}</span>
                      {" · "}by {inv.invitedBy}
                      {" · "}expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleRevoke(inv.id)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors whitespace-nowrap">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
