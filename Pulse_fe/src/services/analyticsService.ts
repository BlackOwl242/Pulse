import api from './api';

export interface WorkloadEntry {
    userId: string; periodDate: string; totalTasks: number; completedTasks: number; overdueTasks: number;
    totalMinutesTracked: number; estimatedMinutesRemaining: number; completionRate: number;
    user: { id: string; firstName: string; lastName: string };
}

export interface OverviewStats {
    projects: number; tasks: number; completedTasks: number; overdueTasks: number;
    members: number; totalTimeMinutes: number; completionRate: number;
}

export const analyticsService = {
    getWorkload: (slug: string) => api.get<WorkloadEntry[]>(`/workspaces/${slug}/analytics/workload`).then(r => r.data),
    getOverview: (slug: string) => api.get<OverviewStats>(`/workspaces/${slug}/analytics/overview`).then(r => r.data),
    exportCsv: (slug: string) =>
        api.get(`/workspaces/${slug}/analytics/export`, { responseType: 'blob' }).then(r => {
            const url = window.URL.createObjectURL(new Blob([r.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${slug}-tasks-export.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }),
};
