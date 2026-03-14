import api from './api';

export interface ChatChannel {
    id: string; name?: string; type: number;
    selfDestructSeconds?: number | null;
    lastMessage?: { content: string; createdAt: string; sender: { firstName: string; lastName: string } };
    memberCount: number; unreadCount: number;
    members?: { userId: string; firstName: string; lastName: string; avatarUrl?: string }[];
}

export interface ChatMessage {
    id: string; content: string; type: number; createdAt: string; isEdited: boolean; replyToId?: string;
    sender: { id: string; firstName: string; lastName: string; avatarUrl?: string };
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    deleteAfterAt?: string | null;
}

export interface SendMessagePayload {
    content: string;
    replyToId?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
}

export const chatService = {
    getChannels: (slug: string) => api.get<ChatChannel[]>(`/workspaces/${slug}/chat/channels`).then(r => r.data),
    createChannel: (slug: string, data: { name?: string; type?: number; memberIds?: string[] }) =>
        api.post(`/workspaces/${slug}/chat/channels`, data).then(r => r.data),
    getMessages: (slug: string, channelId: string, limit = 50, offset = 0) =>
        api.get<ChatMessage[]>(`/workspaces/${slug}/chat/channels/${channelId}/messages`, { params: { limit, offset } }).then(r => r.data),
    sendMessage: (slug: string, channelId: string, payload: SendMessagePayload) =>
        api.post(`/workspaces/${slug}/chat/channels/${channelId}/messages`, payload).then(r => r.data),
    uploadFile: (slug: string, channelId: string, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post<{ url: string; name: string; type: string }>(
            `/workspaces/${slug}/chat/channels/${channelId}/upload`,
            form,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        ).then(r => r.data);
    },
    setDestructTimer: (slug: string, channelId: string, seconds: number | null) =>
        api.put(`/workspaces/${slug}/chat/channels/${channelId}/destruct-timer`, { seconds }).then(r => r.data),
    deleteMessage: (slug: string, messageId: string) => api.delete(`/workspaces/${slug}/chat/messages/${messageId}`),
    hideChannel: (slug: string, channelId: string) => api.delete(`/workspaces/${slug}/chat/channels/${channelId}/hide`),
    leaveChannel: (slug: string, channelId: string) => api.delete(`/workspaces/${slug}/chat/channels/${channelId}/leave`),
};
