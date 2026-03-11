import api from './api';

export interface Meeting {
    id: string; title: string; description?: string; agenda?: string;
    proposedStartTime: string; proposedEndTime: string; status: number;
    organizer: { id: string; firstName: string; lastName: string };
    participants: MeetingParticipant[];
}

export interface MeetingParticipant {
    userId: string; responseStatus: number;
    user: { id: string; firstName: string; lastName: string; avatarUrl?: string };
}

export const meetingService = {
    getAll: (slug: string) => api.get<Meeting[]>(`/workspaces/${slug}/meetings`).then(r => r.data),
    create: (slug: string, data: { title: string; description?: string; agenda?: string; startTime: string; endTime: string; participantIds?: string[] }) =>
        api.post(`/workspaces/${slug}/meetings`, data).then(r => r.data),
    respond: (slug: string, meetingId: string, response: number) =>
        api.put(`/workspaces/${slug}/meetings/${meetingId}/respond`, { response }),
    cancel: (slug: string, meetingId: string) => api.delete(`/workspaces/${slug}/meetings/${meetingId}`),
};
