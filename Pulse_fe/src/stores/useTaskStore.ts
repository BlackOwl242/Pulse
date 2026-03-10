import { create } from 'zustand';
import { Task, BoardColumn, TaskStatus } from '@/types/task';

interface TaskState {
    tasks: Task[];
    boardColumns: BoardColumn[];
    selectedTask: Task | null;
    isLoading: boolean;
    filters: {
        status?: TaskStatus;
        priority?: string;
        assigneeId?: string;
        search?: string;
    };

    setTasks: (tasks: Task[]) => void;
    setBoardColumns: (columns: BoardColumn[]) => void;
    setSelectedTask: (task: Task | null) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    removeTask: (id: string) => void;
    moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;
    setFilters: (filters: Partial<TaskState['filters']>) => void;
    clearFilters: () => void;
    setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>()((set) => ({
    tasks: [],
    boardColumns: [],
    selectedTask: null,
    isLoading: false,
    filters: {},

    setTasks: (tasks) => set({ tasks }),

    setBoardColumns: (boardColumns) => set({ boardColumns }),

    setSelectedTask: (selectedTask) => set({ selectedTask }),

    addTask: (task) =>
        set((state) => ({ tasks: [task, ...state.tasks] })),

    updateTask: (id, updates) =>
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            selectedTask:
                state.selectedTask?.id === id
                    ? { ...state.selectedTask, ...updates }
                    : state.selectedTask,
        })),

    removeTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        })),

    moveTask: (taskId, newStatus, newPosition) =>
        set((state) => {
            const updatedColumns = state.boardColumns.map((col) => ({
                ...col,
                tasks: col.tasks.filter((t) => t.id !== taskId),
            }));

            const task = state.tasks.find((t) => t.id === taskId);
            if (task) {
                const targetCol = updatedColumns.find((c) => c.status === newStatus);
                if (targetCol) {
                    const movedTask = { ...task, status: newStatus, position: newPosition };
                    targetCol.tasks.splice(newPosition, 0, movedTask);
                }
            }

            return {
                boardColumns: updatedColumns,
                tasks: state.tasks.map((t) =>
                    t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
                ),
            };
        }),

    setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

    clearFilters: () => set({ filters: {} }),

    setLoading: (isLoading) => set({ isLoading }),
}));
