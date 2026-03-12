"use client";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

export default function ChatHeaderTitle({ onOpenCreateGroup }: { onOpenCreateGroup?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Chats
        </h3>
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
          <DropdownItem
            onItemClick={() => {
              closeDropdown();
              if (onOpenCreateGroup) onOpenCreateGroup();
            }}
            className="flex w-full whitespace-nowrap font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 gap-2 items-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5v15m7.5-7.5h-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create Group Chat
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
