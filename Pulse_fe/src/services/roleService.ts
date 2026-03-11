import api from './api';
import { Role, PermissionGroup, CreateRoleRequest, UpdateRoleRequest, WorkspaceMember } from '@/types/roles';

export const roleService = {
    // Get all available permissions (grouped by module)
    getPermissions: () =>
        api.get<PermissionGroup[]>('/permissions').then((res) => res.data),

    // Get roles for a workspace (system + custom)
    getRoles: (slug: string) =>
        api.get<Role[]>(`/workspaces/${slug}/roles`).then((res) => res.data),

    // Get a single role
    getRole: (slug: string, roleId: string) =>
        api.get<Role>(`/workspaces/${slug}/roles/${roleId}`).then((res) => res.data),

    // Create a custom role
    createRole: (slug: string, data: CreateRoleRequest) =>
        api.post<Role>(`/workspaces/${slug}/roles`, data).then((res) => res.data),

    // Update a custom role
    updateRole: (slug: string, roleId: string, data: UpdateRoleRequest) =>
        api.put<Role>(`/workspaces/${slug}/roles/${roleId}`, data).then((res) => res.data),

    // Delete a custom role
    deleteRole: (slug: string, roleId: string) =>
        api.delete(`/workspaces/${slug}/roles/${roleId}`).then((res) => res.data),

    // Get workspace members
    getMembers: (slug: string) =>
        api.get<WorkspaceMember[]>(`/workspaces/${slug}/members`).then((res) => res.data),

    // Change a member's role
    changeMemberRole: (slug: string, userId: string, roleId: string) =>
        api.put(`/workspaces/${slug}/members/${userId}/role`, { roleId }).then((res) => res.data),
};
