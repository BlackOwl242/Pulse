"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { aiService, AIConversation, AIMsg } from "@/services/aiService";
import AiLayout from "@/components/ai/AiLayout";
import { useSlug } from '@/hooks/useSlug';

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const slug = useSlug();

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
    <AiLayout 
      conversations={conversations} 
      activeConv={activeConv} 
      openConversation={openConversation} 
      startNew={startNew}
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
                <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-br-sm"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm shadow-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Fixed Input Wrapper from TailAdmin component mapping */}
        <div className="fixed bottom-5 lg:bottom-10 left-1/2 z-20 w-full -translate-x-1/2 transform px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="mx-auto w-full max-w-[720px] pointer-events-auto rounded-3xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
             <div className="flex flex-col">
               <textarea
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => { 
                   if (e.key === "Enter" && !e.shiftKey) { 
                     e.preventDefault(); 
                     sendMessage(); 
                   } 
                 }}
                 placeholder="Type your prompt here..."
                 disabled={sending}
                 className="h-16 w-full resize-none border-none bg-transparent p-0 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
               />
               <div className="flex items-center justify-between pt-2">
                 <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   Attach
                 </button>
                 <button 
                   onClick={sendMessage} 
                   disabled={sending || !input.trim()}
                   className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shadow-sm"
                 >
                   {sending ? (
                     <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M9.99674 3.33252L9.99675 16.667M5 8.32918L9.99984 3.33252L15 8.32918" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   )}
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </AiLayout>
  );
}
