"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { aiService, AIConversation, AIMsg } from "@/services/aiService";

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const slug = "pulse-demo";

  const fetchConvs = useCallback(async () => {
    try { setConversations(await aiService.getConversations(slug)); } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const openConversation = async (id: string) => {
    setActiveConv(id);
    try {
      setMessages(await aiService.getMessages(slug, id));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      if (!activeConv) {
        // Start new conversation
        const result = await aiService.startConversation(slug, input);
        setActiveConv(result.id);
        setMessages(result.messages || []);
        await fetchConvs();
      } else {
        // Continue conversation
        const result = await aiService.sendMessage(slug, activeConv, input);
        setMessages((prev) => [
          ...prev,
          { id: result.userMessage?.id || Date.now().toString(), role: 0, content: input, tokensUsed: 0, createdAt: new Date().toISOString() },
          { id: result.aiMessage?.id || (Date.now() + 1).toString(), role: 1, content: result.aiMessage?.content || "", tokensUsed: 0, createdAt: new Date().toISOString() }
        ]);
      }
      setInput("");
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
    setSending(false);
  };

  const startNew = () => { setActiveConv(null); setMessages([]); setInput(""); };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          <button onClick={startNew} className="p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        {loading ? (
          <div className="p-6 flex justify-center"><div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <li key={c.id}>
                <button onClick={() => openConversation(c.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${activeConv === c.id ? "bg-brand-50/50 dark:bg-brand-500/5 border-r-2 border-brand-500" : ""}`}>
                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{c.lastMessage || "New conversation"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{c.messageCount} messages · {new Date(c.createdAt).toLocaleDateString()}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !activeConv && (
            <div className="flex flex-col items-center justify-center h-full">
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
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 0 ? "justify-end" : ""}`}>
              {msg.role !== 0 && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
              )}
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 0
                ? "bg-brand-500 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80">
          <div className="flex gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask Pulse AI..." disabled={sending}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            <button onClick={sendMessage} disabled={sending || !input.trim()}
              className="px-5 py-3 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 rounded-xl disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm">
              {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
