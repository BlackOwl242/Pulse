"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { aiService, AIConversation, AIMsg } from "@/services/aiService";
import AiLayout from "@/components/ai/AiLayout";
import { useSlug } from '@/hooks/useSlug';
import { useSearchParams } from "next/navigation";

const THINKING_ID = "__thinking__";

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const slug = useSlug();
  const searchParams = useSearchParams();
  const boardId = searchParams.get("boardId");

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const fetchConvs = useCallback(async () => {
    try { setConversations(await aiService.getConversations(slug, "global")); } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const openConversation = async (id: string) => {
    setActiveConv(id);
    try {
      setMessages(await aiService.getMessages(slug, id));
      scrollToBottom();
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const msgText = input;
    setInput("");
    setSending(true);

    // Optimistic: add user message + thinking placeholder immediately
    const tempUserMsg: AIMsg = {
      id: `temp-${Date.now()}`,
      role: 0,
      content: msgText,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    };
    const thinkingMsg: AIMsg = {
      id: THINKING_ID,
      role: 1,
      content: "",
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    };

    if (!activeConv) {
      // New conversation: show user msg + thinking
      setMessages([tempUserMsg, thinkingMsg]);
      scrollToBottom();
      try {
        const isWhiteboardContext = !!boardId;
        const result = await aiService.startConversation(
          slug, 
          msgText, 
          isWhiteboardContext ? "whiteboard" : undefined,
          boardId || undefined
        );
        setActiveConv(result.id);
        setMessages(result.messages || []);
        await fetchConvs();
      } catch {
        // Remove thinking on error
        setMessages([tempUserMsg, { ...thinkingMsg, id: `err-${Date.now()}`, content: "⚠️ Failed to get response. Please try again." }]);
      }
    } else {
      // Existing conversation: add to current messages
      setMessages((prev) => [...prev, tempUserMsg, thinkingMsg]);
      scrollToBottom();
      try {
        const result = await aiService.sendMessage(slug, activeConv, msgText, boardId || undefined);
        // Replace thinking with actual AI response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === THINKING_ID
              ? { id: result.aiMessage?.id || `ai-${Date.now()}`, role: 1, content: result.aiMessage?.content || "", tokensUsed: 0, createdAt: new Date().toISOString() }
              : m.id === tempUserMsg.id
              ? { ...m, id: result.userMessage?.id || m.id }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === THINKING_ID
              ? { ...m, id: `err-${Date.now()}`, content: "⚠️ Failed to get response. Please try again." }
              : m
          )
        );
      }
    }
    scrollToBottom();
    setSending(false);
  };

  const startNew = () => { setActiveConv(null); setMessages([]); setInput(""); };

  const deleteConversation = async (id: string) => {
    try {
      await aiService.deleteConversation(slug, id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv === id) {
        setActiveConv(null);
        setMessages([]);
      }
    } catch {}
  };

  const renameConversation = async (id: string, title: string) => {
    try {
      await aiService.renameConversation(slug, id, title);
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
    } catch {}
  };

  return (
    <AiLayout 
      conversations={conversations} 
      activeConv={activeConv} 
      openConversation={openConversation} 
      startNew={startNew}
      msgInput={input}
      setMsgInput={setInput}
      sendMessage={sendMessage}
      sending={sending}
      deleteConversation={deleteConversation}
      renameConversation={renameConversation}
    >
      <div className="flex flex-col min-h-full p-6">
        {loading ? (
          <div className="flex-1 flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 && !activeConv ? (
          <div className="flex flex-col items-center justify-center h-full flex-1">
            <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pulse AI</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm text-center">Ask about tasks, meetings, reports, or anything else in your workspace.</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-md">
              {["Summarize my tasks", "Help me plan a sprint", "Show team workload", "Schedule a meeting"].map((s) => (
                <button key={s} onClick={() => { setInput(s); }} className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 0 ? "justify-end" : ""}`}>
                {msg.role !== 0 && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  </div>
                )}
                {/* Thinking animation */}
                {msg.id === THINKING_ID ? (
                  <div className="max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">Thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 0
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-sm"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </AiLayout>
  );
}
