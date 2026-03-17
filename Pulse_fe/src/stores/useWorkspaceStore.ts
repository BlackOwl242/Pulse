import { create } from 'zustand';
import api from '@/services/api';
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
    fetchWorkspaces: () => Promise<Workspace[]>;
    clear: () => void;
}

/**
 * Workspace store — NO localStorage persistence.
 * All workspace data is in memory only, fetched from API on each session.
 */
export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,

    setWorkspaces: (workspaces) => {
        set({ workspaces });
        // Auto-select first workspace if no current one
        if (!get().currentWorkspace && workspaces.length > 0) {
            set({ currentWorkspace: workspaces[0] });
        }
    },

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

    fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/workspaces');
            const workspaces = data as Workspace[];
            set({ workspaces, isLoading: false });

            // Auto-select first workspace if no current one
            if (!get().currentWorkspace && workspaces.length > 0) {
                set({ currentWorkspace: workspaces[0] });
            }

            return workspaces;
        } catch {
            set({ isLoading: false });
            return [];
        }
    },

    clear: () => set({ currentWorkspace: null, workspaces: [] }),
}));
