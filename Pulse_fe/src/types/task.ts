export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface Project {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    status: ProjectStatus;
    startDate?: string;
    endDate?: string;
    taskCount: number;
    completedTaskCount: number;
    createdAt: string;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: Assignee;
    deadline?: string;
    startDate?: string;
    position: number;
    estimatedMinutes?: number;
    subtaskCount: number;
    completedSubtaskCount: number;
    commentCount: number;
    attachmentCount: number;
    labels: Label[];
    createdAt: string;
    completedAt?: string;
}

export interface Assignee {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface BoardColumn {
    status: TaskStatus;
    name: string;
    tasks: Task[];
}

export interface CreateTaskRequest {
    projectId: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    deadline?: string;
    startDate?: string;
    parentTaskId?: string;
    estimatedMinutes?: number;
    labelIds?: string[];
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    deadline?: string;
    startDate?: string;
    estimatedMinutes?: number;
    position?: number;
}

export interface MoveTaskRequest {
    status: TaskStatus;
    position: number;
}
