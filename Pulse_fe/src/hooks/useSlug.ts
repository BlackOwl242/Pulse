import { useWorkspaceStore } from '@/stores/useWorkspaceStore';

/**
 * Hook to get the current workspace slug.
 * Returns empty string if no workspace is selected (user needs to create/join one).
 */
export function useSlug(): string {
    const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
    return currentWorkspace?.slug ?? '';
}
