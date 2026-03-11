"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { chatService, ChatChannel, ChatMessage } from "@/services/chatService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const slug = "pulse-demo";

  const fetchChannels = useCallback(async () => {
    try { setChannels(await chatService.getChannels(slug)); } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const openChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    try {
      const msgs = await chatService.getMessages(slug, channelId);
      setMessages(msgs.reverse());
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeChannel) return;
    setSending(true);
    try {
      await chatService.sendMessage(slug, activeChannel, msgInput);
      setMsgInput("");
      const msgs = await chatService.getMessages(slug, activeChannel);
      setMessages(msgs.reverse());
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
    setSending(false);
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "now"; if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const activeChannelData = channels.find((c) => c.id === activeChannel);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Channel List */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : channels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-xs text-gray-400 text-center">No channels yet</p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {channels.map((ch) => (
              <li key={ch.id}>
                <button onClick={() => openChannel(ch.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${activeChannel === ch.id ? "bg-brand-50/50 dark:bg-brand-500/5 border-r-2 border-brand-500" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {ch.name?.charAt(0) || "#"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ch.name || "Direct"}</p>
                      {ch.lastMessage && <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(ch.lastMessage.createdAt)}</span>}
                    </div>
                    {ch.lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ch.lastMessage.sender.firstName}: {ch.lastMessage.content}</p>
                    )}
                  </div>
                  {ch.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 rounded-full">{ch.unreadCount}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-900/30">
        {!activeChannel ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75-9.75-4.365-9.75-9.75S6.615 2.25 12 2.25z" /></svg>
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Select a conversation</p>
              <p className="text-xs text-gray-400 mt-1">Choose a channel to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80">
              <h3 className="font-semibold text-gray-900 dark:text-white">{activeChannelData?.name || "Chat"}</h3>
              <p className="text-xs text-gray-400">{activeChannelData?.memberCount} members</p>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0 mt-0.5">
                      {msg.sender.firstName?.charAt(0)}{msg.sender.lastName?.charAt(0)}
                    </div>
                    <div className={`max-w-[65%] ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{msg.sender.firstName}</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <div className={`px-3 py-2 rounded-xl text-sm ${isMe ? "bg-brand-500 text-white rounded-br-sm" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm"}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80">
              <div className="flex gap-2">
                <input type="text" value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..." disabled={sending}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                <button onClick={sendMessage} disabled={sending || !msgInput.trim()}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors">
                  {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
