import { ReactNode, useState, KeyboardEvent } from "react";
import AiSidebarHistory from "./AiSidebarHistory";
import { AIConversation } from "@/services/aiService";

interface AiLayoutProps {
  children: ReactNode;
  conversations: AIConversation[];
  activeConv: string | null;
  openConversation: (id: string) => void;
  startNew: () => void;
  msgInput: string;
  setMsgInput: (s: string) => void;
  sendMessage: () => void;
  sending: boolean;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
}

export default function AiLayout({ 
  children, conversations, activeConv, openConversation, startNew, msgInput, setMsgInput, sendMessage, sending, deleteConversation, renameConversation
}: AiLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="relative h-[calc(100vh-64px)] xl:h-[calc(100vh-72px)] px-4 xl:flex xl:px-0">
      <div className="my-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 xl:hidden dark:border-gray-800 dark:bg-gray-900">
        <h4 className="pl-2 text-lg font-medium text-gray-800 dark:text-white/90">
          Chats History
        </h4>
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6L20 6M4 18L20 18M4 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main content area with proper height chain */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[720px]">
            {children}
          </div>
        </div>

        {/* Input Bar - at bottom */}
        <div className="shrink-0 pb-2 pt-3 px-4">
          <div className="mx-auto w-full max-w-[720px] rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <textarea
                placeholder="Type your prompt here..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={sending}
                rows={2}
                className="flex-1 resize-none border-none bg-transparent p-0 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
              ></textarea>
              <button 
                onClick={sendMessage}
                disabled={sending || !(msgInput || "").trim()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 shrink-0"
              >
                {sending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none">
                  <path d="M9.99674 3.33252L9.99675 16.667M5 8.32918L9.99984 3.33252L15 8.32918" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AiSidebarHistory
        isSidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConv={activeConv}
        openConversation={openConversation}
        startNew={startNew}
        deleteConversation={deleteConversation}
        renameConversation={renameConversation}
      />
    </div>
  );
}
