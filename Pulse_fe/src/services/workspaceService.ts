import api from './api';
import { Workspace } from '@/types/workspace';

export const workspaceService = {
    getAll: () =>
        api.get<Workspace[]>('/workspaces').then((res) => res.data),

    getBySlug: (slug: string) =>
        api.get<Workspace>(`/workspaces/${slug}`).then((res) => res.data),

    create: (data: { name: string; description?: string }) =>
        api.post<Workspace>('/workspaces', data).then((res) => res.data),

    update: (slug: string, data: { name?: string; description?: string; logoUrl?: string }) =>
        api.put(`/workspaces/${slug}`, data),

    inviteMember: (slug: string, data: { email: string; roleId: string }) =>
        api.post(`/workspaces/${slug}/invitations`, data).then((res) => res.data),
};
