"use client";
import ChatList from "./ChatList";
import ChatHeader from "./ChatHeader";
import { useState } from "react";
import { ChatChannel } from "@/services/chatService";
import { WorkspaceMember } from "@/types/roles";

interface ChatSidebarProps {
  search: string;
  setSearch: (s: string) => void;
  filteredChannels: ChatChannel[];
  filteredDms: ChatChannel[];
  filteredPeople: WorkspaceMember[];
  activeChannel: string | null;
  openChannel: (id: string) => void;
  startDirectMessage: (id: string) => void;
  user: any;
  timeAgo: (d: string) => string;
}

export default function ChatSidebar(props: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 transition-all duration-300 bg-gray-900/50 z-999999"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:flex xl:w-1/4">
        <ChatHeader onToggle={toggleSidebar} search={props.search} setSearch={props.setSearch} />
        <ChatList isOpen={isOpen} onToggle={toggleSidebar} {...props} />
      </div>
    </>
  );
}
