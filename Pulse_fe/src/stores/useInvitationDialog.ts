import { create } from 'zustand';

interface InvitationDialogState {
    isOpen: boolean;
    invitationId: string | null;
    title: string;
    content: string;
    open: (invitationId: string, title: string, content: string) => void;
    close: () => void;
}

export const useInvitationDialog = create<InvitationDialogState>()((set) => ({
    isOpen: false,
    invitationId: null,
    title: '',
    content: '',
    open: (invitationId, title, content) => set({ isOpen: true, invitationId, title, content }),
    close: () => set({ isOpen: false, invitationId: null, title: '', content: '' }),
}));
