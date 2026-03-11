import api from './api';

export interface Checklist {
    id: string;
    title: string;
    position: number;
    items: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    content: string;
    isCompleted: boolean;
    position: number;
    completedAt?: string;
}

export const checklistService = {
    getAll: (slug: string, taskId: string) =>
        api.get<Checklist[]>(`/workspaces/${slug}/tasks/${taskId}/checklists`).then(r => r.data),

    createChecklist: (slug: string, taskId: string, title = "Checklist") =>
        api.post<Checklist>(`/workspaces/${slug}/tasks/${taskId}/checklists`, { title }).then(r => r.data),

    addItem: (slug: string, checklistId: string, content: string) =>
        api.post<ChecklistItem>(`/workspaces/${slug}/checklists/${checklistId}/items`, { content }).then(r => r.data),

    updateItem: (slug: string, itemId: string, data: { isCompleted?: boolean; content?: string }) =>
        api.put(`/workspaces/${slug}/checklist-items/${itemId}`, data).then(r => r.data),

    deleteItem: (slug: string, itemId: string) =>
        api.delete(`/workspaces/${slug}/checklist-items/${itemId}`),

    deleteChecklist: (slug: string, checklistId: string) =>
        api.delete(`/workspaces/${slug}/checklists/${checklistId}`),
};
