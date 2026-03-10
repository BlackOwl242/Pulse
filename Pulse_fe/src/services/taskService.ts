import api from './api';
import { Task, BoardColumn, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from '@/types/task';

export const taskService = {
    getAll: (workspaceSlug: string, projectId: string, params?: {
        status?: string;
        priority?: string;
        assigneeId?: string;
        search?: string;
    }) =>
        api.get<Task[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/tasks`, { params })
            .then((res) => res.data),

    getBoardView: (workspaceSlug: string, projectId: string) =>
        api.get<BoardColumn[]>(`/workspaces/${workspaceSlug}/projects/${projectId}/tasks/board`)
            .then((res) => res.data),

    getById: (workspaceSlug: string, taskId: string) =>
        api.get<Task>(`/workspaces/${workspaceSlug}/tasks/${taskId}`)
            .then((res) => res.data),

    create: (workspaceSlug: string, projectId: string, data: CreateTaskRequest) =>
        api.post<Task>(`/workspaces/${workspaceSlug}/projects/${projectId}/tasks`, data)
            .then((res) => res.data),

    update: (workspaceSlug: string, taskId: string, data: UpdateTaskRequest) =>
        api.put(`/workspaces/${workspaceSlug}/tasks/${taskId}`, data),

    move: (workspaceSlug: string, taskId: string, data: MoveTaskRequest) =>
        api.patch(`/workspaces/${workspaceSlug}/tasks/${taskId}/move`, data),

    delete: (workspaceSlug: string, taskId: string) =>
        api.delete(`/workspaces/${workspaceSlug}/tasks/${taskId}`),
};
