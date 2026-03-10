import { create } from 'zustand';
import { Workspace } from '@/types/workspace';

interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;

    setWorkspaces: (workspaces: Workspace[]) => void;
    setCurrentWorkspace: (workspace: Workspace | null) => void;
    addWorkspace: (workspace: Workspace) => void;
    updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
    setLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,

    setWorkspaces: (workspaces) => set({ workspaces }),

    setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),

    addWorkspace: (workspace) =>
        set((state) => ({ workspaces: [...state.workspaces, workspace] })),

    updateWorkspace: (id, updates) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
            currentWorkspace:
                state.currentWorkspace?.id === id
                    ? { ...state.currentWorkspace, ...updates }
                    : state.currentWorkspace,
        })),

    setLoading: (isLoading) => set({ isLoading }),
}));
