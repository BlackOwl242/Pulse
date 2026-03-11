import api from './api';

export interface Project {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    taskCount: number;
    completedTaskCount: number;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    startDate?: string;
    endDate?: string;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: string;
}

export const projectService = {
    getAll: (workspaceSlug: string) =>
        api.get<Project[]>(`/workspaces/${workspaceSlug}/projects`).then((res) => res.data),

    getById: (workspaceSlug: string, projectId: string) =>
        api.get<Project>(`/workspaces/${workspaceSlug}/projects/${projectId}`).then((res) => res.data),

    create: (workspaceSlug: string, data: CreateProjectRequest) =>
        api.post<Project>(`/workspaces/${workspaceSlug}/projects`, data).then((res) => res.data),

    update: (workspaceSlug: string, projectId: string, data: UpdateProjectRequest) =>
        api.put(`/workspaces/${workspaceSlug}/projects/${projectId}`, data),

    delete: (workspaceSlug: string, projectId: string) =>
        api.delete(`/workspaces/${workspaceSlug}/projects/${projectId}`),
};
