import ChatBoxHeader from "./ChatBoxHeader";
import ChatBoxSendForm from "./ChatBoxSendForm";
import Image from "next/image";
import { ChatChannel, ChatMessage, SendMessagePayload } from "@/services/chatService";
import { RefObject, useState, useEffect } from "react";

interface ChatBoxProps {
  activeChannelData: ChatChannel | undefined;
  messages: ChatMessage[];
  user: any;
  msgInput: string;
  setMsgInput: (s: string) => void;
  sendMessage: (payload: SendMessagePayload) => void;
  sending: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  timeAgo: (d: string) => string;
  onBack?: () => void;
  onChannelAction?: (action: 'hide' | 'leave' | 'delete-channel' | 'kick-all') => void;
  onSetDestructTimer?: (seconds: number | null) => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  slug: string;
}

// ── Self-destruct countdown badge ──────────────────────────────────────────
function DestructCountdown({ deleteAfterAt, onExpire }: { deleteAfterAt: string; onExpire?: () => void }) {
  const totalDuration = Math.max(1, Math.floor((new Date(deleteAfterAt).getTime() - Date.now()) / 1000 + 30));
  const getSecsLeft = () => Math.max(0, Math.floor((new Date(deleteAfterAt).getTime() - Date.now()) / 1000));
  const [secs, setSecs] = useState(getSecsLeft);

  useEffect(() => {
    if (secs <= 0) { onExpire?.(); return; }
    const id = setInterval(() => {
      const left = getSecsLeft();
      setSecs(left);
      if (left <= 0) { clearInterval(id); onExpire?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (secs <= 0) return null;

  const fmt = secs >= 86400 ? `${Math.floor(secs / 86400)}d ${Math.floor((secs % 86400) / 3600)}h`
    : secs >= 3600 ? `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`
    : secs >= 60 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
    : `${secs}s`;

  const progress = Math.min(1, secs / Math.min(totalDuration, 300));
  const isUrgent = secs <= 10;
  const r = 7; const c = 2 * Math.PI * r;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 transition-colors ${
      isUrgent ? 'text-red-500 animate-pulse' : 'text-orange-400'
    }`}>
      <svg width="18" height="18" className="-rotate-90">
        <circle cx="9" cy="9" r={r} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
        <circle cx="9" cy="9" r={r} fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      {fmt}
    </span>
  );
}

// ── Inline media renderer ──────────────────────────────────────────────────
function MessageAttachment({ url, name, type }: { url: string; name?: string; type?: string }) {
  const [lightbox, setLightbox] = useState(false);
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const imgExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"];
  const vidExts = ["mp4", "webm", "ogg", "mov", "avi"];
  const audExts = ["mp3", "wav", "ogg", "aac", "flac", "m4a"];
  const resolvedType = type ?? (imgExts.includes(ext) ? "image" : vidExts.includes(ext) ? "video" : audExts.includes(ext) ? "audio" : "file");

  if (resolvedType === "image") {
    return (
      <>
        <div className="mt-2 block">
          <img src={url} alt={name || "image"} className="max-w-[240px] max-h-[180px] rounded-xl cursor-zoom-in object-cover border border-white/10 shadow-sm block" onClick={() => setLightbox(true)} />
          {name && <p className="text-[11px] opacity-60 mt-1 truncate max-w-[240px]">{name}</p>}
        </div>
        {lightbox && (
          <div className="fixed inset-0 z-[999999] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setLightbox(false)}>
            <img src={url} alt={name} className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        )}
      </>
    );
  }
  if (resolvedType === "video") {
    return (
      <div className="mt-2">
        <video src={url} controls className="max-w-[280px] rounded-xl border border-white/10 shadow-sm" />
        {name && <p className="text-[11px] opacity-60 mt-1 truncate max-w-[280px]">{name}</p>}
      </div>
    );
  }
  if (resolvedType === "audio") {
    return (
      <div className="mt-2">
        <audio src={url} controls className="w-full max-w-[260px]" />
        {name && <p className="text-[11px] opacity-60 mt-1 truncate max-w-[260px]">{name}</p>}
      </div>
    );
  }
  return (
    <a href={url} download={name} target="_blank" rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm max-w-[240px]">
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <span className="truncate">{name || "Download file"}</span>
    </a>
  );
}

export default function ChatBox({ activeChannelData, messages, user, msgInput, setMsgInput, sendMessage, sending, messagesEndRef, timeAgo, onBack, onChannelAction, onSetDestructTimer, isMuted, onMuteToggle, slug }: ChatBoxProps) {
  if (!activeChannelData) {
    return (
      <div className="hidden xl:flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] items-center justify-center p-4">
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
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <ChatBoxHeader
        title={chatName}
        avatarUrl={avatarUrl}
        onBack={onBack}
        isGroup={!isDirect}
        members={activeChannelData.members}
        channelId={activeChannelData.id}
        createdById={activeChannelData.createdById}
        currentUserId={user?.id}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
        onAction={onChannelAction}
        selfDestructSeconds={activeChannelData.selfDestructSeconds}
        onSetDestructTimer={onSetDestructTimer}
      />
      <div className="flex-1 max-h-full p-5 space-y-4 overflow-auto custom-scrollbar xl:space-y-6 xl:p-6">
        {messages.map((chat) => {
          const isSender = chat.sender.id === user?.id;
          // Type 2 = System message
          if (chat.type === 2) {
            return (
              <div key={chat.id} className="flex justify-center">
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                  {chat.content}
                </span>
              </div>
            );
          }
          return (
            <div key={chat.id} className={`flex ${isSender ? "justify-end" : "items-start gap-4"}`}>
              {!isSender && (
                <div className="w-10 h-10 overflow-hidden rounded-full shrink-0 bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                  {chat.sender.avatarUrl ? (
                    <Image width={40} height={40} src={chat.sender.avatarUrl!} alt={`${chat.sender.firstName} profile`} className="object-cover object-center w-full h-full" />
                  ) : chat.sender.firstName.charAt(0)}
                </div>
              )}
              <div className={`${isSender ? "text-right" : ""} max-w-[70%]`}>
                <div className={`px-3 py-2 rounded-lg inline-block ${isSender ? "bg-brand-500 text-white dark:bg-brand-500" : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90"} ${isSender ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                  {chat.content && <p className="text-sm">{chat.content}</p>}
                  {chat.attachmentUrl && <MessageAttachment url={chat.attachmentUrl} name={chat.attachmentName} type={chat.attachmentType} />}
                </div>
                <div className={`mt-1 flex flex-col ${isSender ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-500 text-theme-xs dark:text-gray-400">
                      {isSender ? timeAgo(chat.createdAt) : `${chat.sender.firstName}, ${timeAgo(chat.createdAt)}`}
                    </p>
                    {isSender && (
                      <span className={`inline-flex items-center ${chat.status === 'seen' ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'}`}>
                        {chat.status === 'seen' ? (
                          /* Double check — seen */
                          <svg width="16" height="12" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 8 6 13 14 3" />
                            <polyline points="7 8 12 13 20 3" />
                          </svg>
                        ) : (
                          /* Single check — sent */
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 12 9 17 20 6" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  {chat.deleteAfterAt && <DestructCountdown deleteAfterAt={chat.deleteAfterAt} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <ChatBoxSendForm msgInput={msgInput} setMsgInput={setMsgInput} sending={sending} sendMessage={sendMessage} slug={slug} channelId={activeChannelData.id} />
    </div>
  );
}
