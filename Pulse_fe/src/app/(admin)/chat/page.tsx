"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { chatService, ChatChannel, ChatMessage } from "@/services/chatService";
import { roleService } from "@/services/roleService";
import { WorkspaceMember } from "@/types/roles";
import { useAuthStore } from "@/stores/useAuthStore";
import ChatSidebar from "@/components/chats/ChatSidebar";
import ChatBox from "@/components/chats/ChatBox";

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const slug = "pulse-demo";

  const fetchChannels = useCallback(async () => {
    try { 
      const [chs, mems] = await Promise.all([chatService.getChannels(slug), roleService.getMembers(slug)]);
      setChannels(chs);
      setMembers(mems);
    } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);

  const openChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    try {
      const msgs = await chatService.getMessages(slug, channelId);
      setMessages(msgs.reverse());
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
  };

  const startDirectMessage = async (memberId: string) => {
    if (memberId === user?.id) return;
    
    // Check if DM channel already exists
    const existing = channels.find(c => c.type === 0 && c.members?.some(m => m.userId === memberId));
    if (existing) {
      openChannel(existing.id);
      return;
    }

    try {
      const newChannel = await chatService.createChannel(slug, { type: 0, memberIds: [memberId] });
      await fetchChannels();
      openChannel(newChannel.id);
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

  // Group data for sidebar
  const filteredChannels = channels.filter(c => c.type === 1 && (c.name || "Channel").toLowerCase().includes(search.toLowerCase()));
  
  const filteredDms = channels.filter(c => c.type === 0 && 
    (c.members?.filter(m => m.userId !== user?.id).some(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())) || "Direct").toString()
  );

  // Members we don't have a DM with yet
  const dmMems = new Set(channels.filter(c => c.type === 0).flatMap(c => c.members?.map(m => m.userId) || []));
  const filteredPeople = members.filter(m => 
    m.userId !== user?.id && !dmMems.has(m.userId) &&
    (`${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex h-[calc(100vh-64px)] xl:h-[calc(100vh-88px)] flex-col gap-6 xl:flex-row">
      <ChatSidebar 
        search={search} setSearch={setSearch}
        filteredChannels={filteredChannels} filteredDms={filteredDms} filteredPeople={filteredPeople}
        activeChannel={activeChannel} openChannel={openChannel} startDirectMessage={startDirectMessage}
        user={user} timeAgo={timeAgo}
      />
      <ChatBox 
        activeChannelData={activeChannelData} messages={messages} user={user}
        msgInput={msgInput} setMsgInput={setMsgInput} sendMessage={sendMessage} sending={sending}
        messagesEndRef={messagesEndRef} timeAgo={timeAgo}
      />
    </div>
  );
}
