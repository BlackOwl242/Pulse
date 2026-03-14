"use client";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Image from "next/image";

interface Member {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface ChatBoxHeaderProps {
  title?: string;
  avatarUrl?: string;
  onBack?: () => void;
  isGroup?: boolean;
  members?: Member[];
  onAction?: (action: 'hide' | 'leave') => void;
  selfDestructSeconds?: number | null;
  onSetDestructTimer?: (seconds: number | null) => void;
}

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Off", value: null },
  { label: "10 seconds", value: 10 },
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
  { label: "1 day", value: 86400 },
  { label: "1 week", value: 604800 },
];

function timerLabel(seconds: number | null | undefined) {
  if (!seconds) return null;
  return TIMER_OPTIONS.find(o => o.value === seconds)?.label ?? `${seconds}s`;
}

function MembersModal({ members, onClose }: { members: Member[]; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Group Members
            <span className="ml-2 text-sm font-normal text-gray-400">({members.length})</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <ul className="max-h-72 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                {m.avatarUrl ? (
                  <Image src={m.avatarUrl} alt={`${m.firstName} ${m.lastName}`} width={36} height={36} className="object-cover w-full h-full" />
                ) : m.firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white/90">{m.firstName} {m.lastName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TimerModal({ current, onSelect, onClose }: { current: number | null | undefined; onSelect: (v: number | null) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xs bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Disappearing Messages</h3>
            <p className="text-xs text-gray-400 mt-0.5">Messages delete after being seen</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <ul className="p-2 space-y-0.5 max-h-80 overflow-y-auto custom-scrollbar">
          {TIMER_OPTIONS.map(opt => (
            <li key={String(opt.value)}>
              <button
                onClick={() => { onSelect(opt.value); onClose(); }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between ${
                  opt.value === (current ?? null)
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                {opt.label}
                {opt.value === (current ?? null) && (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-brand-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ChatBoxHeader({ title, avatarUrl, onBack, isGroup, members = [], onAction, selfDestructSeconds, onSetDestructTimer }: ChatBoxHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const activeLabel = timerLabel(selfDestructSeconds);

  return (
    <>
      <div className="sticky flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 xl:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex xl:hidden items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="relative h-12 w-full max-w-[48px] rounded-full flex items-center justify-center bg-brand-500 text-white font-bold text-xl overflow-hidden shrink-0">
            {avatarUrl ? (
              <Image width={48} height={48} src={avatarUrl} alt="Profile" className="object-cover object-center w-full h-full" />
            ) : (title ? title.charAt(0).toUpperCase() : "#")}
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900"></span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">{title || "Chat"}</h4>
            <p className="text-gray-500 text-theme-xs dark:text-gray-400 whitespace-nowrap flex items-center gap-1.5">
              {isGroup ? `${members.length} members` : "Online"}
              {activeLabel && (
                <span className="inline-flex items-center gap-0.5 text-orange-500 dark:text-orange-400 font-medium">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/></svg>
                  {activeLabel}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Self-destruct timer button */}
          <button
            onClick={() => setShowTimer(true)}
            title="Disappearing messages"
            className={`p-2 rounded-lg transition-colors ${activeLabel ? "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* More options */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="dropdown-toggle text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="5" cy="12" r="1.5" />
              </svg>
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-52 p-2">
              {isGroup ? (
                <>
                  <DropdownItem onItemClick={() => { setIsOpen(false); setShowMembers(true); }}
                    className="flex w-full items-center gap-2.5 whitespace-nowrap font-normal text-left text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 px-3 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    View Members
                  </DropdownItem>
                  <DropdownItem onItemClick={() => { setIsOpen(false); if (onAction) onAction('hide'); }}
                    className="flex w-full items-center gap-2.5 whitespace-nowrap font-normal text-left text-error-500 rounded-lg hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 px-3 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Delete Chat
                  </DropdownItem>
                  <DropdownItem onItemClick={() => { setIsOpen(false); if (onAction) onAction('leave'); }}
                    className="flex w-full items-center gap-2.5 whitespace-nowrap font-normal text-left text-error-500 rounded-lg hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 px-3 py-2 text-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Leave Group
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem onItemClick={() => { setIsOpen(false); if (onAction) onAction('hide'); }}
                  className="flex w-full items-center gap-2.5 whitespace-nowrap font-normal text-left text-error-500 rounded-lg hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 px-3 py-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Delete Conversation
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        </div>
      </div>

      {showMembers && isGroup && <MembersModal members={members} onClose={() => setShowMembers(false)} />}
      {showTimer && (
        <TimerModal
          current={selfDestructSeconds}
          onSelect={(v) => { if (onSetDestructTimer) onSetDestructTimer(v); }}
          onClose={() => setShowTimer(false)}
        />
      )}
    </>
  );
}
