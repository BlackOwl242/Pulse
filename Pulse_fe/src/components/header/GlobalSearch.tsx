"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { workspaceService } from "@/services/workspaceService";
import { useSlug } from "@/hooks/useSlug";

interface SearchResult {
  tasks: { id: string; title: string; status: number; priority: number; projectName: string; projectId: string; assignee: string }[];
  projects: { id: string; name: string; color: string; icon: string; status: string }[];
}

const STATUS_LABELS: Record<number, string> = { 0: "To Do", 1: "In Progress", 2: "In Review", 3: "Done", 4: "Cancelled" };

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const slug = useSlug();
  const debounceRef = useRef<NodeJS.Timeout>();

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || !slug) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await workspaceService.search(slug, q);
      setResults(data);
      setOpen(true);
    } catch { setResults(null); }
    setLoading(false);
  }, [slug]);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); setOpen(true); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = (path: string) => { router.push(path); setOpen(false); setQuery(""); };

  const hasResults = results && (results.tasks.length > 0 || results.projects.length > 0);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search tasks, projects..."
          className="h-11 w-full xl:w-[430px] pl-12 pr-16 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-transparent dark:bg-white/[0.03] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
            <span>Ctrl</span> <span>K</span>
          </span>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {!hasResults && !loading && (
            <div className="p-4 text-center text-sm text-gray-400">No results for &quot;{query}&quot;</div>
          )}

          {results && results.projects.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Projects</div>
              {results.projects.map((p) => (
                <button key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ backgroundColor: p.color || "#6366f1" }}>
                    {p.icon || p.name?.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {results && results.tasks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-gray-800">Tasks</div>
              {results.tasks.map((t) => (
                <button key={t.id} onClick={() => navigate(`/projects/${t.projectId}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{t.title}</p>
                    <p className="text-[10px] text-gray-400">{t.projectName} · {STATUS_LABELS[t.status] || "Unknown"}{t.assignee ? ` · ${t.assignee}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
