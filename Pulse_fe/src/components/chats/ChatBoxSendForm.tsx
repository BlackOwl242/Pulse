"use client";
import { useRef, useState } from "react";
import { chatService, SendMessagePayload } from "@/services/chatService";

interface ChatBoxSendFormProps {
  msgInput: string;
  setMsgInput: (s: string) => void;
  sendMessage: (payload: SendMessagePayload) => void;
  sending: boolean;
  slug: string;
  channelId: string;
}

type PendingFile = { file: File; previewUrl: string; kind: "image" | "file" | "audio" };

export default function ChatBoxSendForm({ msgInput, setMsgInput, sendMessage, sending, slug, channelId }: ChatBoxSendFormProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const [pending, setPending] = useState<PendingFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickFile = (kind: "image" | "file" | "audio", ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const handleFileChange = (kind: "image" | "file" | "audio") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPending({ file, previewUrl, kind });
    e.target.value = "";
  };

  const clearPending = () => {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msgInput.trim() && !pending) return;

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;
    let attachmentType: string | undefined;

    if (pending) {
      setUploading(true);
      try {
        const result = await chatService.uploadFile(slug, channelId, pending.file);
        attachmentUrl = result.url;
        attachmentName = result.name;
        attachmentType = result.type; // "image" | "video" | "audio"
      } catch {
        setUploading(false);
        return;
      }
      setUploading(false);
      clearPending();
    }

    sendMessage({ content: msgInput.trim() || "", attachmentUrl, attachmentName, attachmentType });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 shrink-0">
      {/* Preview bar */}
      {pending && (
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          {pending.kind === "image" && (
            <img src={pending.previewUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0" />
          )}
          {pending.kind === "audio" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-brand-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
              <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{pending.file.name}</span>
            </div>
          )}
          {pending.kind === "file" && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-gray-500 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{pending.file.name}</span>
            </div>
          )}
          <span className="text-xs text-gray-400 truncate max-w-[120px] hidden sm:block">
            {(pending.file.size / 1024).toFixed(0)} KB
          </span>
          <button type="button" onClick={clearPending}
            className="ml-auto p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Text input row */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 pt-3 pb-2">
        <input
          type="text"
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={pending ? "Add a caption (optional)…" : "Type a message…"}
          className="flex-1 px-4 py-2 text-sm text-gray-800 bg-gray-100 dark:bg-white/5 rounded-full outline-none placeholder:text-gray-400 dark:text-white/90"
        />
        <button
          type="submit"
          disabled={sending || uploading || (!msgInput.trim() && !pending)}
          className="flex items-center justify-center shrink-0 text-white rounded-full h-9 w-9 bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {(sending || uploading)
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.98481 2.44399C3.11333 1.57147 1.15325 3.46979 1.96543 5.36824L3.82086 9.70527C3.90146 9.89367 3.90146 10.1069 3.82086 10.2953L1.96543 14.6323C1.15326 16.5307 3.11332 18.4291 4.98481 17.5565L16.8184 12.0395C18.5508 11.2319 18.5508 8.76865 16.8184 7.961L4.98481 2.44399ZM3.34453 4.77824C3.0738 4.14543 3.72716 3.51266 4.35099 3.80349L16.1846 9.32051C16.762 9.58973 16.762 10.4108 16.1846 10.68L4.35098 16.197C3.72716 16.4879 3.0738 15.8551 3.34453 15.2223L5.19996 10.8853C5.21944 10.8397 5.23735 10.7937 5.2537 10.7473L9.11784 10.7473C9.53206 10.7473 9.86784 10.4115 9.86784 9.99726C9.86784 9.58304 9.53206 9.24726 9.11784 9.24726L5.25157 9.24726C5.2358 9.20287 5.2186 9.15885 5.19996 9.11528L3.34453 4.77824Z" fill="white"/>
              </svg>
          }
        </button>
      </form>

      {/* Hidden inputs */}
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange("image")} />
      <input ref={fileRef}  type="file" accept="*/*"     className="hidden" onChange={handleFileChange("file")} />
      <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange("audio")} />

      {/* Media toolbar */}
      <div className="flex items-center gap-1 px-3 pb-3 pt-0.5">
        {/* Image */}
        <button type="button" onClick={() => pickFile("image", imageRef)}
          title="Send image"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:text-gray-400 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span>Image</span>
        </button>

        {/* File */}
        <button type="button" onClick={() => pickFile("file", fileRef)}
          title="Send file"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:text-gray-400 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          <span>File</span>
        </button>

        {/* Audio */}
        <button type="button" onClick={() => pickFile("audio", audioRef)}
          title="Send audio"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:text-gray-400 transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
          </svg>
          <span>Audio</span>
        </button>
      </div>
    </div>
  );
}
