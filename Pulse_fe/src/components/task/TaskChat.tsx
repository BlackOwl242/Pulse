"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { commentService, Comment } from "@/services/commentService";
import { roleService } from "@/services/roleService";
import { WorkspaceMember } from "@/types/roles";
import { useSlug } from "@/hooks/useSlug";

interface TaskChatProps {
  taskId: string;
  onCommentCountChange?: (count: number) => void;
}

export default function TaskChat({ taskId, onCommentCountChange }: TaskChatProps) {
  const slug = useSlug();
  const [comments, setComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    if (!slug) return;
    try {
      const [cmts, mems] = await Promise.all([
        commentService.getAll(slug, taskId),
        roleService.getMembers(slug),
      ]);
      setComments(cmts);
      setMembers(mems);
      onCommentCountChange?.(cmts.length);
    } catch {}
    setLoading(false);
  }, [slug, taskId, onCommentCountChange]);

  useEffect(() => { fetchComments(); }, [fetchComments]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await commentService.create(slug, taskId, { content: message });
      setMessage("");
      await fetchComments();
    } catch {}
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (val: string) => {
    setMessage(val);
    // Detect @ trigger
    const cursor = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setShowMentions(true);
      setMentionFilter(atMatch[1].toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: WorkspaceMember) => {
    const cursor = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = message.slice(0, cursor);
    const textAfterCursor = message.slice(cursor);
    const beforeAt = textBeforeCursor.replace(/@\w*$/, "");
    const mention = `@${member.firstName} ${member.lastName} `;
    setMessage(beforeAt + mention + textAfterCursor);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const filteredMembers = members.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(mentionFilter)
  );

  const formatTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Task Chat</h4>
        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{comments.length}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-80">
        {loading ? (
          <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No messages yet. Use @ to mention team members.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {c.author.avatarUrl ? (
                  <img src={c.author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  `${c.author.firstName?.charAt(0)}${c.author.lastName?.charAt(0)}`
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">{c.author.firstName} {c.author.lastName}</span>
                  <span className="text-[10px] text-gray-400">{formatTime(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{
                    __html: c.content.replace(/@(\w+\s?\w+)/g, '<span class="text-brand-500 font-medium">@$1</span>')
                  }}
                />
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 relative">
        {/* @mention dropdown */}
        {showMentions && filteredMembers.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
            {filteredMembers.map((m) => (
              <button key={m.userId} onClick={() => insertMention(m)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left text-sm">
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                  {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                </div>
                <span className="text-gray-700 dark:text-gray-200">{m.firstName} {m.lastName}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... use @ to mention"
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none resize-none"
          />
          <button onClick={handleSend} disabled={sending || !message.trim()}
            className="px-3 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
