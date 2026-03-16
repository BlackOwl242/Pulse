import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest, ChangePasswordRequest } from '@/types/auth';

export const authService = {
    register: (data: RegisterRequest) =>
        api.post<AuthResponse>('/auth/register', data).then((res) => res.data),

    login: (data: LoginRequest) =>
        api.post<AuthResponse>('/auth/login', data).then((res) => res.data),

    refreshToken: (refreshToken: string) =>
        api.post<AuthResponse>('/auth/refresh-token', { refreshToken }).then((res) => res.data),

    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (req: ResetPasswordRequest) => api.post('/auth/reset-password', req),
    changePassword: (req: ChangePasswordRequest) => api.put('/auth/change-password', req),

    setToken(token: string) {
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
    },
};
