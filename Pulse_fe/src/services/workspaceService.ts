import api from './api';
import { Workspace } from '@/types/workspace';

export interface PendingInvitation {
    id: string;
    email: string;
    roleId: string;
    roleName: string;
    invitedBy: string;
    expiresAt: string;
    createdAt: string;
    status: string;
}

export const workspaceService = {
    getAll: () =>
        api.get<Workspace[]>('/workspaces').then((res) => res.data),

    search: (slug: string, q: string) =>
        api.get(`/workspaces/${slug}/search`, { params: { q } }).then(r => r.data),

    getBySlug: (slug: string) =>
        api.get<Workspace>(`/workspaces/${slug}`).then((res) => res.data),

    create: (data: { name: string; description?: string }) =>
        api.post<Workspace>('/workspaces', data).then((res) => res.data),

    update: (slug: string, data: { name?: string; description?: string; logoUrl?: string }) =>
        api.put(`/workspaces/${slug}`, data),

    inviteMember: (slug: string, data: { email: string; roleId: string }) =>
        api.post(`/workspaces/${slug}/invitations`, data).then((res) => res.data),

    getInvitations: (slug: string) =>
        api.get<PendingInvitation[]>(`/workspaces/${slug}/invitations`).then((res) => res.data),

    revokeInvitation: (slug: string, invitationId: string) =>
        api.delete(`/workspaces/${slug}/invitations/${invitationId}`).then((res) => res.data),

    addMemberByEmail: (slug: string, data: { email: string; roleId: string }) =>
        api.post(`/workspaces/${slug}/members/add`, data).then((res) => res.data),

    removeMember: (slug: string, userId: string) =>
        api.delete(`/workspaces/${slug}/members/${userId}`).then((res) => res.data),

    acceptInvitation: (invitationId: string) =>
        api.post(`/workspaces/invitations/${invitationId}/accept`).then((res) => res.data),

    declineInvitation: (invitationId: string) =>
        api.post(`/workspaces/invitations/${invitationId}/decline`).then((res) => res.data),

    leaveWorkspace: (slug: string) =>
        api.post(`/workspaces/${slug}/leave`).then((res) => res.data),

    deleteWorkspace: (slug: string) =>
        api.delete(`/workspaces/${slug}`).then((res) => res.data),

    transferOwnership: (slug: string, newOwnerId: string) =>
        api.post(`/workspaces/${slug}/transfer`, { newOwnerId }).then((res) => res.data),

    getMyInvitations: () =>
        api.get('/workspaces/my-invitations').then((res) => res.data),
};
