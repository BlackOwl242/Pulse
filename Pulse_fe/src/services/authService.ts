import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth';

export const authService = {
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data).then((res) => res.data),

    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data).then((res) => res.data),

    refreshToken: (refreshToken: string) =>
        api.post<AuthResponse>('/auth/refresh-token', { refreshToken }).then((res) => res.data),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }).then((res) => res.data),

    resetPassword: (token: string, newPassword: string) =>
        api.post('/auth/reset-password', { token, newPassword }).then((res) => res.data),

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }).then((res) => res.data),
};
