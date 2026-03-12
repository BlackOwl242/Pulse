import api from './api';

export interface Team {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: string;
    memberCount: number;
    members: TeamMemberInfo[];
}

export interface TeamMemberInfo {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    joinedAt?: string;
}

export interface CreateTeamRequest {
    name: string;
    description?: string;
    color?: string;
}

export interface AddTeamMemberRequest {
    userId: string;
    role?: string;
}

export const teamService = {
    getAll: (workspaceSlug: string) =>
        api.get<Team[]>(`/workspaces/${workspaceSlug}/teams`).then((res) => res.data),

    getById: (workspaceSlug: string, teamId: string) =>
        api.get<Team>(`/workspaces/${workspaceSlug}/teams/${teamId}`).then((res) => res.data),

    create: (workspaceSlug: string, data: CreateTeamRequest) =>
        api.post<Team>(`/workspaces/${workspaceSlug}/teams`, data).then((res) => res.data),

    addMember: (workspaceSlug: string, teamId: string, data: AddTeamMemberRequest) =>
        api.post(`/workspaces/${workspaceSlug}/teams/${teamId}/members`, data),

    removeMember: (workspaceSlug: string, teamId: string, userId: string) =>
        api.delete(`/workspaces/${workspaceSlug}/teams/${teamId}/members/${userId}`),

    deleteTeam: (workspaceSlug: string, teamId: string) =>
        api.delete(`/workspaces/${workspaceSlug}/teams/${teamId}`),
};
