import api from './api';

export interface NotificationItem {
    id: string;
    type: number;
    title: string;
    content?: string;
    entityType?: string;
    entityId?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    actor?: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

export interface NotificationsResponse {
    notifications: NotificationItem[];
    unreadCount: number;
}

export const notificationService = {
    getAll: (slug: string, limit = 20) =>
        api.get<NotificationsResponse>(`/workspaces/${slug}/notifications`, { params: { limit } }).then(r => r.data),

    markAsRead: (slug: string, id: string) =>
        api.put(`/workspaces/${slug}/notifications/${id}/read`),

    markAllAsRead: (slug: string) =>
        api.put(`/workspaces/${slug}/notifications/read-all`),
};
