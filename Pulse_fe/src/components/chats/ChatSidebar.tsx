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
  onOpenCreateGroup?: () => void;
}

export default function ChatSidebar(props: ChatSidebarProps) {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <ChatHeader search={props.search} setSearch={props.setSearch} onOpenCreateGroup={props.onOpenCreateGroup} />
      <ChatList {...props} />
    </div>
  );
}
