import api from './api';

export interface ActivityItem {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    description: string;
    createdAt: string;
    actor: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

export const activityService = {
    getAll: (slug: string, limit = 50) =>
        api.get<ActivityItem[]>(`/workspaces/${slug}/activity`, { params: { limit } }).then(r => r.data),
};
