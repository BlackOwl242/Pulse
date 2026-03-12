import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";
import Image from "next/image";
import { ChatChannel, ChatMessage } from "@/services/chatService";
import { RefObject } from "react";

interface ChatBoxProps {
  activeChannelData: ChatChannel | undefined;
  messages: ChatMessage[];
  user: any;
  msgInput: string;
  setMsgInput: (s: string) => void;
  sendMessage: () => void;
  sending: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  timeAgo: (d: string) => string;
}

const chatList: ChatItem[] = [
  {
    id: 1,
    name: "Kaiya George",
    role: "Project Manager",
    profileImage: "/images/user/user-18.jpg",
    status: "online",
    lastActive: "15 mins",
    message: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
    isSender: false,
  },
  {
    id: 2,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "30 mins",
    message: "I want to make an appointment tomorrow from 2:00 to 5:00pm?",
    isSender: false,
  },
  {
    id: 3,
    name: "You",
    role: "",
    profileImage: "",
    status: "online",
    lastActive: "2 hours ago",
    message: "If don’t like something, I’ll stay away from it.",
    isSender: true,
  },
  {
    id: 4,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "2 hours ago",
    message: "I want more detailed information.",
    isSender: false,
  },
  {
    id: 5,
    name: "You",
    role: "",
    profileImage: "",
    status: "online",
    lastActive: "2 hours ago",
    message: "They got there early, and got really good seats.",
    isSender: true,
  },
  {
    id: 6,
    name: "Lindsey Curtis",
    role: "Designer",
    profileImage: "/images/user/user-17.jpg",
    status: "online",
    lastActive: "2 hours ago",
    message: "Please preview the image",
    isSender: false,
    imagePreview: "/images/chat/chat.jpg",
  },
];

export default function ChatBox({ activeChannelData, messages, user, msgInput, setMsgInput, sendMessage, sending, messagesEndRef, timeAgo }: ChatBoxProps) {
  if (!activeChannelData) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4 items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center dark:bg-brand-500/10 text-brand-500">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const isDirect = activeChannelData.type === 0;
  const otherUser = isDirect ? activeChannelData.members?.find(m => m.userId !== user?.id) || activeChannelData.members?.[0] : null;
  const chatName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : (activeChannelData.name || "Chat");
  const avatarUrl = otherUser?.avatarUrl || "";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      {/* <!-- ====== Chat Box Start --> */}
      <ChatBoxHeader title={chatName} avatarUrl={avatarUrl} />
      <div className="flex-1 max-h-full p-5 space-y-6 overflow-auto custom-scrollbar xl:space-y-8 xl:p-6">
        {messages.map((chat) => {
          const isSender = chat.sender.id === user?.id;
          return (
          <div
            key={chat.id}
            className={`flex ${
              isSender ? "justify-end" : "items-start gap-4"
            }`}
          >
            {!isSender && (
              <div className="w-10 h-10 overflow-hidden rounded-full shrink-0 bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                {chat.sender.avatarUrl ? (
                <Image
                  width={40}
                  height={40}
                  src={chat.sender.avatarUrl!}
                  alt={`${chat.sender.firstName} profile`}
                  className="object-cover object-center w-full h-full"
                />
                ) : chat.sender.firstName.charAt(0)}
              </div>
            )}

            <div className={`${isSender ? "text-right" : ""}`}>
              <div
                className={`px-3 py-2 rounded-lg ${
                  isSender
                    ? "bg-brand-500 text-white dark:bg-brand-500"
                    : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90"
                } ${isSender ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              >
                <p className="text-sm ">{chat.content}</p>
              </div>
              <p className="mt-2 text-gray-500 text-theme-xs dark:text-gray-400">
                {isSender
                  ? timeAgo(chat.createdAt)
                  : `${chat.sender.firstName}, ${timeAgo(chat.createdAt)}`}
              </p>
            </div>
          </div>
        )})}
        <div ref={messagesEndRef} />
      </div>
      <ChatBoxSendForm msgInput={msgInput} setMsgInput={setMsgInput} sending={sending} sendMessage={sendMessage} />
      {/* <!-- ====== Chat Box End --> */}
    </div>
  );
}
