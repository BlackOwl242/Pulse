"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { notificationService, NotificationItem } from "@/services/notificationService";
import { connectNotifications } from "@/lib/socket";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useNotificationPrefs, NOTIF_TYPE_TO_SECTION } from "@/stores/useNotificationPrefs";
import { useSlug } from '@/hooks/useSlug';
import { useInvitationDialog } from "@/stores/useInvitationDialog";

const NOTIF_LABELS: Record<number, string> = {
  0: "mentioned you",
  1: "assigned a task to you",
  2: "deadline reminder",
  3: "commented on a task",
  4: "invited you to a workspace",
  5: "changed a task status",
  6: "sent you a message",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const slug = useSlug();
  const connectedRef = useRef(false);
  const { showToast } = useToast();
  const openInviteDialog = useInvitationDialog((s) => s.open);

  const fetchNotifications = useCallback(async () => {
    if (!slug) return;
    try {
      const data = await notificationService.getAll(slug);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }, [slug]);

  // Initial fetch + SignalR real-time listener
  useEffect(() => {
    fetchNotifications();

    if (!connectedRef.current) {
      connectedRef.current = true;
      connectNotifications((data: any) => {
        const section = NOTIF_TYPE_TO_SECTION[data.type as number];
        const prefs = useNotificationPrefs.getState();
        const sectionPref = section ? prefs.sections[section] : undefined;

        // Skip entirely if section notifications are disabled
        if (sectionPref && !sectionPref.enabled) return;

        const notif: NotificationItem = {
          id: data.id,
          type: data.type,
          title: data.title,
          content: data.content,
          entityType: data.entityType,
          entityId: data.entityId,
          isRead: false,
          createdAt: data.createdAt,
          actor: data.actorId ? { id: data.actorId, firstName: "", lastName: "" } : undefined,
        };
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((c) => c + 1);

        // Dispatch event so workspace settings page can re-fetch (e.g. invitation accepted)
        if (data.entityType === "workspace" || data.entityType === "invitation") {
          window.dispatchEvent(new Event("workspace-updated"));
        }

        // Show toast only if toast is enabled for this section
        if (!sectionPref || sectionPref.toast) {
          const toastTitle = data.title ?? NOTIF_LABELS[data.type] ?? "New notification";
          const toastMsg = data.content;

          // If it's an invitation, make the toast clickable
          if (data.entityType === "invitation" && data.entityId) {
            showToast(toastTitle, toastMsg, "info", () => {
              useInvitationDialog.getState().open(data.entityId, toastTitle, toastMsg || "");
            });
          } else {
            showToast(toastTitle, toastMsg);
          }
        }
      }).catch(console.error);
    }
  }, [fetchNotifications]);

  const handleClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) fetchNotifications();
  };

  const closeDropdown = () => setIsOpen(false);

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead(slug);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const handleNotifClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(slug, n.id);
        setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch { /* ignore */ }
    }

    // If it's an invitation notification, open the global invitation dialog
    if (n.entityType === "invitation" && n.entityId) {
      closeDropdown();
      openInviteDialog(n.entityId, n.title, n.content || "");
      return;
    }

    closeDropdown();
    // Navigate to entity
    if (n.entityType === "task" && n.entityId) {
      router.push(`/tasks/${n.entityId}`);
    } else if (n.entityType === "channel" && n.entityId) {
      router.push(`/chat`);
    }
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal text-brand-500">{unreadCount} unread</span>
            )}
          </h5>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button onClick={async () => { try { await notificationService.clearAll(slug); setNotifications([]); setUnreadCount(0); } catch {} }} className="text-xs text-red-400 hover:text-red-500 font-medium">
                Clear all
              </button>
            )}
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                Mark all read
              </button>
            )}
            <button onClick={closeDropdown} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
            </li>
          ) : (
            notifications.map((n) => (
              <li key={n.id}>
                <DropdownItem
                  onItemClick={() => handleNotifClick(n)}
                  className={`flex gap-3 rounded-xl border-b border-gray-100 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5 transition-colors ${!n.isRead ? "bg-brand-50/60 dark:bg-brand-500/5" : ""}`}
                >
                  <span className="relative block w-10 h-10 rounded-full shrink-0">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-brand-400 to-brand-600">
                      {n.actor
                        ? `${n.actor.firstName?.charAt(0) || "?"}${n.actor.lastName?.charAt(0) || ""}`
                        : "S"}
                    </span>
                    {!n.isRead && (
                      <span className="absolute bottom-0 right-0 z-10 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-brand-500 dark:border-gray-900" />
                    )}
                  </span>
                  <span className="block min-w-0 flex-1">
                    <span className="mb-1 block text-theme-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {n.actor && (
                        <span className="font-semibold text-gray-800 dark:text-white/90">
                          {n.actor.firstName} {n.actor.lastName}{" "}
                        </span>
                      )}
                      <span>{NOTIF_LABELS[n.type] ?? n.title}</span>
                      {n.content && (
                        <span className="font-medium text-gray-800 dark:text-white/90"> &quot;{n.content}&quot;</span>
                      )}
                    </span>
                    <span className="text-gray-400 text-theme-xs dark:text-gray-500">{timeAgo(n.createdAt)}</span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
