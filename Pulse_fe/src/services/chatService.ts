import api from './api';

export interface ChatChannel {
    id: string; name?: string; type: number;
    lastMessage?: { content: string; createdAt: string; sender: { firstName: string; lastName: string } };
    memberCount: number; unreadCount: number;
    members?: { userId: string; firstName: string; lastName: string; avatarUrl?: string }[];
}

export interface ChatMessage {
    id: string; content: string; type: number; createdAt: string; isEdited: boolean; replyToId?: string;
    sender: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

export const chatService = {
    getChannels: (slug: string) => api.get<ChatChannel[]>(`/workspaces/${slug}/chat/channels`).then(r => r.data),
    createChannel: (slug: string, data: { name?: string; type?: number; memberIds?: string[] }) =>
        api.post(`/workspaces/${slug}/chat/channels`, data).then(r => r.data),
    getMessages: (slug: string, channelId: string, limit = 50, offset = 0) =>
        api.get<ChatMessage[]>(`/workspaces/${slug}/chat/channels/${channelId}/messages`, { params: { limit, offset } }).then(r => r.data),
    sendMessage: (slug: string, channelId: string, content: string, replyToId?: string) =>
        api.post(`/workspaces/${slug}/chat/channels/${channelId}/messages`, { content, replyToId }).then(r => r.data),
    deleteMessage: (slug: string, messageId: string) => api.delete(`/workspaces/${slug}/chat/messages/${messageId}`),
};
