import api from './api';

export interface TaskLabel {
    id: string;
    name: string;
    color: string;
}

export const labelService = {
    getAll: (slug: string, projectId: string) =>
        api.get<TaskLabel[]>(`/workspaces/${slug}/projects/${projectId}/labels`).then(r => r.data),

    create: (slug: string, projectId: string, data: { name: string; color?: string }) =>
        api.post<TaskLabel>(`/workspaces/${slug}/projects/${projectId}/labels`, data).then(r => r.data),

    delete: (slug: string, labelId: string) =>
        api.delete(`/workspaces/${slug}/labels/${labelId}`),

    assignToTask: (slug: string, taskId: string, labelId: string) =>
        api.post(`/workspaces/${slug}/tasks/${taskId}/labels/${labelId}`),

    removeFromTask: (slug: string, taskId: string, labelId: string) =>
        api.delete(`/workspaces/${slug}/tasks/${taskId}/labels/${labelId}`),
};
