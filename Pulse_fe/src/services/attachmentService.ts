import api from './api';

export interface Attachment {
    id: string; fileName: string; fileUrl: string; fileType?: string; fileSize: number; createdAt: string;
    uploadedBy: { id: string; firstName: string; lastName: string };
}

export const attachmentService = {
    getAll: (slug: string, taskId: string) =>
        api.get<Attachment[]>(`/workspaces/${slug}/tasks/${taskId}/attachments`).then(r => r.data),
    add: (slug: string, taskId: string, data: { fileName: string; fileUrl: string; fileType?: string; fileSize: number }) =>
        api.post(`/workspaces/${slug}/tasks/${taskId}/attachments`, data).then(r => r.data),
    remove: (slug: string, attId: string) => api.delete(`/workspaces/${slug}/attachments/${attId}`),
};
