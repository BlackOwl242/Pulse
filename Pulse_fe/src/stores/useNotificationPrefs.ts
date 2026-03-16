import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SectionPref {
    enabled: boolean;  // show in notification dropdown
    toast: boolean;    // show toast popup
}

interface NotificationPrefsState {
    sections: {
        chat: SectionPref;
        tasks: SectionPref;
        projects: SectionPref;
        meetings: SectionPref;
        workspace: SectionPref;
    };
    toggleEnabled: (section: keyof NotificationPrefsState['sections']) => void;
    toggleToast: (section: keyof NotificationPrefsState['sections']) => void;
    isSectionEnabled: (section: keyof NotificationPrefsState['sections']) => boolean;
    isToastEnabled: (section: keyof NotificationPrefsState['sections']) => boolean;
}

const DEFAULT: SectionPref = { enabled: true, toast: true };

export const useNotificationPrefs = create<NotificationPrefsState>()(
    persist(
        (set, get) => ({
            sections: {
                chat: { ...DEFAULT },
                tasks: { ...DEFAULT },
                projects: { ...DEFAULT },
                meetings: { ...DEFAULT },
                workspace: { ...DEFAULT },
            },
            toggleEnabled: (section) =>
                set((s) => ({
                    sections: {
                        ...s.sections,
                        [section]: { ...s.sections[section], enabled: !s.sections[section].enabled },
                    },
                })),
            toggleToast: (section) =>
                set((s) => ({
                    sections: {
                        ...s.sections,
                        [section]: { ...s.sections[section], toast: !s.sections[section].toast },
                    },
                })),
            isSectionEnabled: (section) => get().sections[section].enabled,
            isToastEnabled: (section) => get().sections[section].toast,
        }),
        { name: 'pulse-notification-prefs' }
    )
);

// Map NotificationType number → section key
export const NOTIF_TYPE_TO_SECTION: Record<number, keyof NotificationPrefsState['sections']> = {
    0: 'workspace',  // Mention
    1: 'tasks',      // TaskAssigned
    2: 'tasks',      // Deadline
    3: 'tasks',      // Comment
    4: 'workspace',  // Invitation
    5: 'tasks',      // StatusChanged
    6: 'chat',       // Message
};
