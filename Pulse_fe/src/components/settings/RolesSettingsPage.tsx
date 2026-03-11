"use client";
import React, { useEffect, useState, useCallback } from "react";
import { roleService } from "@/services/roleService";
import { Role, Permission, PermissionGroup } from "@/types/roles";

// ===== Permission Module Labels & Icons =====
const MODULE_META: Record<string, { label: string; icon: string; color: string }> = {
  workspace: { label: "Workspace", icon: "🏢", color: "#6366f1" },
  project: { label: "Project", icon: "📁", color: "#10b981" },
  task: { label: "Task", icon: "✅", color: "#f59e0b" },
  team: { label: "Team", icon: "👥", color: "#3b82f6" },
  role: { label: "Role", icon: "🛡️", color: "#ef4444" },
};

const ACTION_LABELS: Record<string, string> = {
  manage: "Full management",
  invite_member: "Invite members",
  remove_member: "Remove members",
  create: "Create",
  view: "View",
  edit: "Edit",
  delete: "Delete",
  manage_members: "Manage members",
  assign: "Assign",
  change_status: "Change status",
};

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  // Expanded role card
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  // Delete confirmation
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // TODO: Replace with actual workspace slug from context
  const workspaceSlug = "pulse-demo";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        roleService.getRoles(workspaceSlug),
        roleService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissionGroups(permsData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load roles";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions(new Set());
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    setShowModal(true);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModule = (module: string) => {
    const modulePerms = permissionGroups
      .find((g) => g.module === module)
      ?.permissions.map((p) => p.id) || [];
    const allSelected = modulePerms.every((id) => selectedPermissions.has(id));
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      modulePerms.forEach((id) => {
        if (allSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!roleName.trim()) return;
    setSaving(true);
    try {
      if (editingRole) {
        await roleService.updateRole(workspaceSlug, editingRole.id, {
          name: roleName,
          description: roleDescription,
          permissionIds: Array.from(selectedPermissions),
        });
      } else {
        await roleService.createRole(workspaceSlug, {
          name: roleName,
          description: roleDescription,
          permissionIds: Array.from(selectedPermissions),
        });
      }
      setShowModal(false);
      await fetchData();
    } catch {
      setError("Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await roleService.deleteRole(workspaceSlug, deletingRole.id);
      setDeletingRole(null);
      await fetchData();
    } catch {
      setError("Failed to delete role. It may still be assigned to users.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage roles and control what each member can do in your workspace
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Role
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid gap-4">
        {roles.map((role) => {
          const isExpanded = expandedRoleId === role.id;
          const permCount = role.permissions.length;
          const totalPerms = permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0);

          return (
            <div
              key={role.id}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Role Card Header */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer"
                onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      role.isSystem
                        ? "bg-gradient-to-br from-brand-500 to-brand-600"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                  >
                    {role.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {role.name}
                      </h3>
                      {role.isSystem && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {role.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                    {permCount}/{totalPerms} permissions
                  </span>
                  {!role.isSystem && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(role); }}
                        className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                        title="Edit role"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingRole(role); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete role"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded Permissions */}
              {isExpanded && (
                <div className="px-6 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissionGroups.map((group) => {
                      const meta = MODULE_META[group.module] || { label: group.module, icon: "📦", color: "#6b7280" };
                      const rolePermIds = new Set(role.permissions.map((p) => p.id));
                      return (
                        <div key={group.module} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-base">{meta.icon}</span>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {meta.label}
                            </h4>
                          </div>
                          <div className="space-y-1">
                            {group.permissions.map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center gap-2 text-xs"
                              >
                                {rolePermIds.has(perm.id) ? (
                                  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                    <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </span>
                                )}
                                <span className={rolePermIds.has(perm.id) ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}>
                                  {ACTION_LABELS[perm.action] || perm.action}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Create/Edit Modal ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {/* Name & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Reviewer, Lead Developer"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="Brief description of what this role can do"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Permissions Selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Permissions
                </h3>
                <div className="space-y-3">
                  {permissionGroups.map((group) => {
                    const meta = MODULE_META[group.module] || { label: group.module, icon: "📦", color: "#6b7280" };
                    const allIds = group.permissions.map((p) => p.id);
                    const allSelected = allIds.every((id) => selectedPermissions.has(id));
                    const someSelected = allIds.some((id) => selectedPermissions.has(id));

                    return (
                      <div
                        key={group.module}
                        className="rounded-lg border border-gray-100 dark:border-gray-800 overflow-hidden"
                      >
                        {/* Module Header */}
                        <label
                          className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                            onChange={() => toggleModule(group.module)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                          />
                          <span className="text-base">{meta.icon}</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {meta.label}
                          </span>
                          <span className="ml-auto text-xs text-gray-400">
                            {allIds.filter((id) => selectedPermissions.has(id)).length}/{allIds.length}
                          </span>
                        </label>
                        {/* Permission Items */}
                        <div className="grid grid-cols-2 gap-0 px-4 py-2">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 py-1.5 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.has(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {ACTION_LABELS[perm.action] || perm.action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !roleName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {editingRole ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation ===== */}
      {deletingRole && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20">
              <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-1">
              Delete Role
            </h3>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{deletingRole.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingRole(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
