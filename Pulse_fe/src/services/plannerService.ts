import api from './api';

export interface PlannerBlock {
    id: string; title?: string; startTime: string; endTime: string; type: number; recurrencePattern?: string;
    task?: { id: string; title: string; status: number } | null;
}

export const plannerService = {
    getBlocks: (slug: string, date: string) =>
        api.get<PlannerBlock[]>(`/workspaces/${slug}/planner`, { params: { date } }).then(r => r.data),
    create: (slug: string, data: { taskId?: string; title?: string; startTime: string; endTime: string; type?: number }) =>
        api.post<PlannerBlock>(`/workspaces/${slug}/planner`, data).then(r => r.data),
    update: (slug: string, blockId: string, data: { title?: string; startTime?: string; endTime?: string; type?: number }) =>
        api.put(`/workspaces/${slug}/planner/${blockId}`, data).then(r => r.data),
    remove: (slug: string, blockId: string) => api.delete(`/workspaces/${slug}/planner/${blockId}`),
};
