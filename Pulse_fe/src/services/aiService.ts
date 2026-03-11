import api from './api';

export interface AIConversation {
    id: string; context: string; contextEntityId?: string; createdAt: string;
    lastMessage?: string; messageCount: number;
}

export interface AIMsg { id: string; role: number; content: string; tokensUsed: number; createdAt: string; }

export const aiService = {
    getConversations: (slug: string) => api.get<AIConversation[]>(`/workspaces/${slug}/ai/conversations`).then(r => r.data),
    getMessages: (slug: string, convId: string) => api.get<AIMsg[]>(`/workspaces/${slug}/ai/conversations/${convId}/messages`).then(r => r.data),
    startConversation: (slug: string, message: string, context?: string) =>
        api.post(`/workspaces/${slug}/ai/conversations`, { message, context }).then(r => r.data),
    sendMessage: (slug: string, convId: string, message: string) =>
        api.post(`/workspaces/${slug}/ai/conversations/${convId}/messages`, { message }).then(r => r.data),
};
