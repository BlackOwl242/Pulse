import api from './api';

export interface TaskDep {
    id: string; taskId: string; dependsOnTaskId: string; type: number;
    task: { id: string; title: string; status: number };
    dependsOnTask: { id: string; title: string; status: number };
}

export const dependencyService = {
    getAll: (slug: string, taskId: string) =>
        api.get<TaskDep[]>(`/workspaces/${slug}/tasks/${taskId}/dependencies`).then(r => r.data),
    add: (slug: string, taskId: string, dependsOnTaskId: string, type = 0) =>
        api.post(`/workspaces/${slug}/tasks/${taskId}/dependencies`, { dependsOnTaskId, type }).then(r => r.data),
    remove: (slug: string, depId: string) => api.delete(`/workspaces/${slug}/dependencies/${depId}`),
};
