import api from './api';

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    jobTitle?: string;
    department?: string;
    phone?: string;
    bio?: string;
    timezone?: string;
    skills: string[];
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    department?: string;
    phone?: string;
    bio?: string;
    timezone?: string;
}

export const profileService = {
    get: () => api.get<UserProfile>('/profile').then(r => r.data),
    update: (data: UpdateProfileRequest) => api.put('/profile', data),
    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<{ avatarUrl: string }>('/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data);
    },
    removeAvatar: () => api.delete('/profile/avatar'),
};
