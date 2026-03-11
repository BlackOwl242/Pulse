import api from './api';

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: CommentAuthor;
    replies?: Comment[];
}

export interface CommentAuthor {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface CreateCommentRequest {
    content: string;
    parentCommentId?: string;
}

export const commentService = {
    getAll: (workspaceSlug: string, taskId: string) =>
        api.get<Comment[]>(`/workspaces/${workspaceSlug}/tasks/${taskId}/comments`).then((res) => res.data),

    create: (workspaceSlug: string, taskId: string, data: CreateCommentRequest) =>
        api.post<Comment>(`/workspaces/${workspaceSlug}/tasks/${taskId}/comments`, data).then((res) => res.data),

    delete: (workspaceSlug: string, commentId: string) =>
        api.delete(`/workspaces/${workspaceSlug}/comments/${commentId}`),
};
