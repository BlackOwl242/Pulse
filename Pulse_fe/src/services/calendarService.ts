import api from './api';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    location?: string;
    type: 'event' | 'deadline';
}

export interface CalendarData {
    events: CalendarEvent[];
    deadlines: CalendarEvent[];
}

export interface CreateCalendarEventRequest {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    location?: string;
}

export const calendarService = {
    getEvents: (slug: string, month: number, year: number) =>
        api.get<CalendarData>(`/workspaces/${slug}/calendar`, { params: { month, year } }).then(r => r.data),

    createEvent: (slug: string, data: CreateCalendarEventRequest) =>
        api.post(`/workspaces/${slug}/calendar`, data).then(r => r.data),

    deleteEvent: (slug: string, eventId: string) =>
        api.delete(`/workspaces/${slug}/calendar/${eventId}`),
};
