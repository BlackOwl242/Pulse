import api from './api';

export interface Attachment {
    id: string; fileName: string; fileUrl: string; fileType?: string; fileSize: number; createdAt: string;
    uploadedBy: { id: string; firstName: string; lastName: string };
}

export const attachmentService = {
  getForTask: (workspaceSlug: string, taskId: string) =>
    api.get<Attachment[]>(`/workspaces/${workspaceSlug}/tasks/${taskId}/attachments`).then(r => r.data),
  
  uploadForTask: (workspaceSlug: string, taskId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Attachment>(`/workspaces/${workspaceSlug}/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(r => r.data);
  },

  delete: (workspaceSlug: string, attachmentId: string) =>
    api.delete(`/workspaces/${workspaceSlug}/attachments/${attachmentId}`)
};
