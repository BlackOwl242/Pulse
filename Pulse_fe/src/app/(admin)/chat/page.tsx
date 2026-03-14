"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { chatService, ChatChannel, ChatMessage, SendMessagePayload } from "@/services/chatService";
import { roleService } from "@/services/roleService";
import { WorkspaceMember } from "@/types/roles";
import { useAuthStore } from "@/stores/useAuthStore";
import ChatSidebar from "@/components/chats/ChatSidebar";
import ChatBox from "@/components/chats/ChatBox";
import CreateGroupChatModal from "@/components/chats/CreateGroupChatModal";
import { connectChat, joinChatChannel, leaveChatChannel, disconnectAll } from "@/lib/socket";

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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChannelRef = useRef<string | null>(null);
  const slug = "pulse-demo";

  const fetchChannels = useCallback(async () => {
    try { 
      const [chs, mems] = await Promise.all([chatService.getChannels(slug), roleService.getMembers(slug)]);
      setChannels(chs);
      setMembers(mems);
    } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { 
    fetchChannels(); 
    
    let mounted = true;
    connectChat(
      (data: any) => {
        if (!mounted) return;
        if (activeChannelRef.current === data.channelId) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, data as ChatMessage];
          });
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
          
          // Auto mark-as-read for non-sender messages
          if (data.sender?.id !== user?.id) {
            chatService.markAsRead(slug, data.channelId, [data.id]).catch(() => {});
          }
        }
        fetchChannels();
      },
      undefined,
      // MessagesDeleted: remove from UI immediately
      (deletedIds: string[]) => {
        if (!mounted) return;
        setMessages(prev => prev.filter(m => !deletedIds.includes(m.id)));
      },
      // MessageStatusUpdated: update status in local state
      (updates: { messageId: string; status: string; readByCount: number }[]) => {
        if (!mounted) return;
        setMessages(prev => prev.map(m => {
          const update = updates.find(u => u.messageId === m.id);
          if (update) return { ...m, status: update.status as 'sent' | 'seen', readByCount: update.readByCount };
          return m;
        }));
      },
      // MessagesDestructStarted: update deleteAfterAt
      (data: { messageIds: string[]; deleteAt: string }) => {
        if (!mounted) return;
        setMessages(prev => prev.map(m => {
          if (data.messageIds.includes(m.id)) return { ...m, deleteAfterAt: data.deleteAt };
          return m;
        }));
      }
    ).catch(console.error);

    return () => { mounted = false; };
  }, [fetchChannels]);

  useEffect(() => {
    if (activeChannel) {
      joinChatChannel(activeChannel).catch(console.error);
    }
    // Don't leave channel groups — stay subscribed so we receive messages
    // even for hidden channels (allows them to reappear on new messages)
  }, [activeChannel]);

  const openChannel = async (channelId: string) => {
    setActiveChannel(channelId);
    activeChannelRef.current = channelId;
    try {
      const msgs = await chatService.getMessages(slug, channelId);
      const reversed = msgs.reverse();
      setMessages(reversed);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
      // Mark non-sender messages as read
      const nonSenderMsgIds = reversed.filter(m => m.sender.id !== user?.id && m.type !== 2).map(m => m.id);
      if (nonSenderMsgIds.length > 0) {
        chatService.markAsRead(slug, channelId, nonSenderMsgIds).catch(() => {});
      }
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

  const sendMessage = async (payload: SendMessagePayload) => {
    if (!payload.content.trim() && !payload.attachmentUrl) return;
    if (!activeChannel) return;
    setSending(true);
    setMsgInput("");
    try {
      await chatService.sendMessage(slug, activeChannel, payload);
      // SignalR ReceiveMessage event will append the message for both sender and receiver
    } catch {
      if (payload.content) setMsgInput(payload.content);
    }
    setSending(false);
  };

  const handleSetDestructTimer = async (seconds: number | null) => {
    if (!activeChannel) return;
    try {
      await chatService.setDestructTimer(slug, activeChannel, seconds);
      // Refresh channels so selfDestructSeconds is updated in activeChannelData
      await fetchChannels();
    } catch {}
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return "now"; if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const activeChannelData = channels.find((c) => c.id === activeChannel);

  const handleChannelAction = async (action: 'hide' | 'leave' | 'delete-channel' | 'kick-all') => {
    if (!activeChannel) return;
    try {
      if (action === 'hide') {
        await chatService.hideChannel(slug, activeChannel);
      } else if (action === 'leave') {
        await chatService.leaveChannel(slug, activeChannel);
      } else if (action === 'delete-channel') {
        if (!confirm("Delete this chat for everyone? All messages will be permanently deleted.")) return;
        await chatService.deleteChannel(slug, activeChannel);
      } else if (action === 'kick-all') {
        if (!confirm("Remove all members from this group?")) return;
        await chatService.kickAll(slug, activeChannel);
      }
      setActiveChannel(null);
      activeChannelRef.current = null;
      await fetchChannels();
    } catch {}
  };

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
    <div className="flex h-[calc(100vh-64px)] xl:h-[calc(100vh-88px)] flex-col xl:flex-row xl:gap-6 w-full max-w-full">
      <div className={`h-full ${activeChannel ? 'hidden xl:block' : 'block'} flex-1 xl:flex-none xl:w-80 2xl:w-96 shrink-0 overflow-hidden`}>
        <ChatSidebar 
          search={search} setSearch={setSearch}
          filteredChannels={filteredChannels} filteredDms={filteredDms} filteredPeople={filteredPeople}
          activeChannel={activeChannel} openChannel={openChannel} startDirectMessage={startDirectMessage}
          user={user} timeAgo={timeAgo} onOpenCreateGroup={() => setIsGroupModalOpen(true)}
        />
      </div>
      <div className={`h-full ${!activeChannel ? 'hidden xl:block' : 'block'} flex-1 min-w-0 overflow-hidden`}>
        <ChatBox 
          activeChannelData={activeChannelData} messages={messages} user={user}
          msgInput={msgInput} setMsgInput={setMsgInput} sendMessage={sendMessage} sending={sending}
          messagesEndRef={messagesEndRef} timeAgo={timeAgo} onBack={() => { setActiveChannel(null); activeChannelRef.current = null; }}
          onChannelAction={handleChannelAction}
          onSetDestructTimer={handleSetDestructTimer}
          slug={slug}
        />
      </div>
      <CreateGroupChatModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        members={members}
        user={user}
        slug={slug}
        onCreated={async (id) => {
          await fetchChannels();
          openChannel(id);
        }}
      />
    </div>
  );
}
