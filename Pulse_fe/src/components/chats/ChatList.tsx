import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import Image from "next/image";
import { ChatChannel } from "@/services/chatService";
import { WorkspaceMember } from "@/types/roles";

interface ChatListProps {
  isOpen: boolean;
  onToggle: () => void;
  filteredChannels: ChatChannel[];
  filteredDms: ChatChannel[];
  filteredPeople: WorkspaceMember[];
  activeChannel: string | null;
  openChannel: (id: string) => void;
  startDirectMessage: (id: string) => void;
  user: any;
  timeAgo: (d: string) => string;
  search: string;
}

export default function ChatList({ 
    isOpen, onToggle, filteredChannels, filteredDms, filteredPeople, activeChannel, openChannel, startDirectMessage, user, timeAgo, search 
}: ChatListProps) {
  const [isOpenTwo, setIsOpenTwo] = useState(false);

  function toggleDropdownTwo() {
    setIsOpenTwo(!isOpenTwo);
  }

  function closeDropdownTwo() {
    setIsOpenTwo(false);
  }
  return (
    <div
      className={`flex-col overflow-auto no-scrollbar transition-all duration-300 ${
        isOpen
          ? "fixed top-0 left-0 z-999999 h-screen bg-white dark:bg-gray-900"
          : "hidden xl:flex"
      }`}
    >
      <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 xl:hidden">
        <div>
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Chat
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <div>
            <button className="dropdown-toggle" onClick={toggleDropdownTwo}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown
              isOpen={isOpenTwo}
              onClose={closeDropdownTwo}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdownTwo}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdownTwo}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-700 transition border border-gray-300 rounded-full dark:border-gray-700 dark:text-gray-400 dark:hover:text-white/90"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col max-h-full px-4 overflow-auto sm:px-5 pb-5">
        <div className="max-h-full space-y-1 overflow-auto custom-scrollbar">

          {/* Team Channels */}
          {(filteredChannels.length > 0 || search) && (
            <div className="py-2">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">Channels</h3>
              <div className="space-y-1">
                {filteredChannels.length === 0 ? <p className="px-3 text-xs text-gray-400 italic">No channels found</p> : 
                  filteredChannels.map((ch) => (
                  <div key={ch.id} onClick={() => openChannel(ch.id)} className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors ${activeChannel === ch.id ? "bg-gray-100 dark:bg-white/[0.05]" : ""}`}>
                    <div className="relative h-12 w-full max-w-[48px] rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold text-lg">
                      #
                    </div>
                    <div className="w-full min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-2">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                            {ch.name}
                          </h5>
                          {ch.lastMessage && (
                            <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400 truncate">
                              {ch.lastMessage.sender.firstName}: {ch.lastMessage.content}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1.5">
                          {ch.lastMessage && <span className="text-gray-400 text-theme-xs">{timeAgo(ch.lastMessage.createdAt)}</span>}
                          {ch.unreadCount > 0 && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Direct Messages */}
          {(filteredDms.length > 0 || search) && (
            <div className="py-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">Direct Messages</h3>
              <div className="space-y-1">
                {filteredDms.length === 0 ? <p className="px-3 text-xs text-gray-400 italic">No messages found</p> : 
                  filteredDms.map((ch) => {
                    const otherUser = ch.members?.find(m => m.userId !== user?.id) || ch.members?.[0];
                    const name = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "User";
                    return (
                    <div key={ch.id} onClick={() => openChannel(ch.id)} className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors ${activeChannel === ch.id ? "bg-gray-100 dark:bg-white/[0.05]" : ""}`}>
                      <div className="relative h-12 w-full max-w-[48px] rounded-full bg-brand-500 flex items-center justify-center text-white font-bold overflow-hidden">
                        {otherUser?.avatarUrl ? <img src={otherUser.avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : name.charAt(0)}
                        {ch.unreadCount > 0 && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>}
                      </div>
                      <div className="w-full min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 pr-2">
                            <h5 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                              {name}
                            </h5>
                            {ch.lastMessage ? (
                              <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400 truncate">{ch.lastMessage.content}</p>
                            ) : (
                              <p className="mt-0.5 text-theme-xs text-gray-400 italic">No messages yet</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end shrink-0 gap-1.5">
                            {ch.lastMessage && <span className="text-gray-400 text-theme-xs">{timeAgo(ch.lastMessage.createdAt)}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                })}
              </div>
            </div>
          )}

          {/* People Directory */}
          {filteredPeople.length > 0 && (
            <div className="py-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-2">People Directory</h3>
              <div className="space-y-1">
                {filteredPeople.map((m) => (
                  <div key={m.userId} onClick={() => startDirectMessage(m.userId)} className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors">
                    <div className="relative h-12 w-full max-w-[48px] rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white font-bold overflow-hidden">
                      {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover" alt="avatar" /> : `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`}
                    </div>
                    <div className="w-full min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-2">
                          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                            {m.firstName} {m.lastName}
                          </h5>
                          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400 truncate">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
