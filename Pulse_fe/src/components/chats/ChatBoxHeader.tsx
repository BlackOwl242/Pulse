"use client";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Image from "next/image";

export default function ChatBoxHeader({ title, avatarUrl, onBack, isGroup, onAction }: { title?: string, avatarUrl?: string, onBack?: () => void, isGroup?: boolean, onAction?: (action: 'hide' | 'leave') => void }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="sticky flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 xl:px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="flex xl:hidden items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="relative h-12 w-full max-w-[48px] rounded-full flex items-center justify-center bg-brand-500 text-white font-bold text-xl overflow-hidden shrink-0">
          {avatarUrl ? (
          <Image
            width={48}
            height={48}
            src={avatarUrl}
            alt="Profile"
            className="object-cover object-center w-full h-full"
          />
          ) : (title ? title.charAt(0).toUpperCase() : "#")}
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-success-500 dark:border-gray-900"></span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
            {title || "Chat"}
          </h4>
          <p className="text-gray-500 text-theme-xs dark:text-gray-400">
            Online
          </p>
        </div>
      </div>
      
      <div className="relative">
        <button onClick={toggleDropdown} className="dropdown-toggle text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
          </svg>
        </button>
        <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-48 p-2">
          {isGroup ? (
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                if (onAction) onAction('leave');
              }}
              className="flex w-full whitespace-nowrap font-normal text-left text-error-500 rounded-lg hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 gap-2 items-center"
            >
              Rời nhóm
            </DropdownItem>
          ) : (
            <DropdownItem
              onItemClick={() => {
                closeDropdown();
                if (onAction) onAction('hide');
              }}
              className="flex w-full whitespace-nowrap font-normal text-left text-error-500 rounded-lg hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 gap-2 items-center"
            >
              Xóa cuộc trò chuyện
            </DropdownItem>
          )}
        </Dropdown>
      </div>

    </div>
  );
}
