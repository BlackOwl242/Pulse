import api from './api';

export interface OKRObjective {
    id: string;
    title: string;
    description?: string;
    period?: string;
    status: number;
    progress: number;
    startDate?: string;
    endDate?: string;
    owner: { id: string; firstName: string; lastName: string };
    keyResults: OKRKeyResult[];
}

export interface OKRKeyResult {
    id: string;
    title: string;
    metricType: number;
    startValue: number;
    targetValue: number;
    currentValue: number;
    progress: number;
    unit?: string;
    owner: { id: string; firstName: string; lastName: string };
}

export interface CreateObjectiveRequest {
    title: string;
    description?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateKRRequest {
    title: string;
    metricType?: number;
    startValue?: number;
    targetValue?: number;
    unit?: string;
}

export interface CheckInRequest {
    newValue: number;
    note?: string;
    confidence?: number;
}

export const okrService = {
    getAll: (slug: string, period?: string) =>
        api.get<OKRObjective[]>(`/workspaces/${slug}/objectives`, { params: { period } }).then(r => r.data),

    create: (slug: string, data: CreateObjectiveRequest) =>
        api.post<OKRObjective>(`/workspaces/${slug}/objectives`, data).then(r => r.data),

    addKeyResult: (slug: string, objectiveId: string, data: CreateKRRequest) =>
        api.post<OKRKeyResult>(`/workspaces/${slug}/objectives/${objectiveId}/key-results`, data).then(r => r.data),

    checkIn: (slug: string, krId: string, data: CheckInRequest) =>
        api.put(`/workspaces/${slug}/objectives/key-results/${krId}/check-in`, data).then(r => r.data),
};
