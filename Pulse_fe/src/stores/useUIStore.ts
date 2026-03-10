import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    taskDetailOpen: boolean;
    taskDetailId: string | null;
    commandPaletteOpen: boolean;

    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    openTaskDetail: (taskId: string) => void;
    closeTaskDetail: () => void;
    toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    theme: 'system',
    taskDetailOpen: false,
    taskDetailId: null,
    commandPaletteOpen: false,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    setTheme: (theme) => set({ theme }),
    openTaskDetail: (taskId) => set({ taskDetailOpen: true, taskDetailId: taskId }),
    closeTaskDetail: () => set({ taskDetailOpen: false, taskDetailId: null }),
    toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
}));
