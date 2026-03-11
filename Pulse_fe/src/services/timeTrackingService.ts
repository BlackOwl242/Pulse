import api from './api';

export interface TimeEntry {
    id: string;
    description?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    isBillable: boolean;
    user?: { id: string; firstName: string; lastName: string };
    task?: { id: string; title: string };
}

export interface LogTimeRequest {
    description?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    isBillable: boolean;
}

export const timeTrackingService = {
    getTaskEntries: (slug: string, taskId: string) =>
        api.get<TimeEntry[]>(`/workspaces/${slug}/tasks/${taskId}/time-entries`).then(r => r.data),

    logTime: (slug: string, taskId: string, data: LogTimeRequest) =>
        api.post<TimeEntry>(`/workspaces/${slug}/tasks/${taskId}/time-entries`, data).then(r => r.data),

    deleteEntry: (slug: string, entryId: string) =>
        api.delete(`/workspaces/${slug}/time-entries/${entryId}`),

    getMyEntries: (slug: string, from?: string, to?: string) =>
        api.get<{ entries: TimeEntry[]; totalMinutes: number }>(`/workspaces/${slug}/my-time-entries`, { params: { from, to } }).then(r => r.data),
};
