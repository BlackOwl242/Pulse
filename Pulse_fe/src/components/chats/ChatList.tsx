import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";
import Image from "next/image";
import { ChatChannel } from "@/services/chatService";
import { WorkspaceMember } from "@/types/roles";

interface ChatListProps {
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
    filteredChannels, filteredDms, filteredPeople, activeChannel, openChannel, startDirectMessage, user, timeAgo, search 
}: ChatListProps) {
  const [isOpenTwo, setIsOpenTwo] = useState(false);

  function toggleDropdownTwo() {
    setIsOpenTwo(!isOpenTwo);
  }

  function closeDropdownTwo() {
    setIsOpenTwo(false);
  }
  return (
    <div className="flex flex-col flex-1 overflow-auto no-scrollbar transition-all duration-300">
      <div className="flex flex-col h-full px-4 overflow-auto sm:px-5 pb-5">
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
