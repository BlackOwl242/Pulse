"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { taskService } from "@/services/taskService";
import { projectService } from "@/services/projectService";

interface SearchResult {
  id: string;
  type: "page" | "project" | "task";
  title: string;
  subtitle?: string;
  href: string;
}

const PAGES: SearchResult[] = [
  { id: "dashboard", type: "page", title: "Dashboard", href: "/dashboard" },
  { id: "projects", type: "page", title: "Projects", href: "/projects" },
  { id: "my-tasks", type: "page", title: "My Tasks", href: "/my-tasks" },
  { id: "chat", type: "page", title: "Chat", href: "/chat" },
  { id: "calendar", type: "page", title: "Calendar", href: "/calendar" },
  { id: "meetings", type: "page", title: "Meetings", href: "/meetings" },
  { id: "ai", type: "page", title: "AI Assistant", href: "/ai" },
  { id: "planner", type: "page", title: "Planner", href: "/planner" },
  { id: "reports", type: "page", title: "Reports", href: "/reports" },
  { id: "objectives", type: "page", title: "OKR", href: "/objectives" },
  { id: "settings-members", type: "page", title: "Members Settings", href: "/settings/members" },
  { id: "settings-roles", type: "page", title: "Roles Settings", href: "/settings/roles" },
  { id: "settings-teams", type: "page", title: "Teams Settings", href: "/settings/teams" },
  { id: "settings-notifications", type: "page", title: "Notification Settings", href: "/settings/notifications" },
  { id: "profile", type: "page", title: "Profile", href: "/profile" },
];

const ICONS: Record<string, React.ReactNode> = {
  page: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  project: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  task: (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const slug = "pulse-demo";

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const lower = q.toLowerCase();

    // Filter pages
    const pageResults = PAGES.filter(p => p.title.toLowerCase().includes(lower));

    // Fetch projects
    let projectResults: SearchResult[] = [];
    try {
      const projs = await projectService.getAll(slug);
      projectResults = projs
        .filter((p: any) => p.name.toLowerCase().includes(lower))
        .slice(0, 5)
        .map((p: any) => ({ id: p.id, type: "project" as const, title: p.name, subtitle: `${p.taskCount} tasks`, href: `/projects/${p.id}` }));
    } catch {}

    setResults([...pageResults.slice(0, 5), ...projectResults]);
    setSelected(0);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    router.push(result.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      handleSelect(results[selected]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group results by type
  const grouped: Record<string, SearchResult[]> = {};
  results.forEach(r => {
    if (!grouped[r.type]) grouped[r.type] = [];
    grouped[r.type].push(r);
  });

  const typeLabels: Record<string, string> = { page: "Pages", project: "Projects", task: "Tasks" };
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, projects, tasks..."
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">No results found for &quot;{query}&quot;</p>
            </div>
          ) : query ? (
            <div className="py-2">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {typeLabels[type] || type}
                  </p>
                  {items.map((item) => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelected(idx)}
                        className={`flex items-center gap-3 w-full px-5 py-2.5 text-left text-sm transition-colors ${
                          idx === selected
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className={idx === selected ? "text-brand-500" : "text-gray-400"}>{ICONS[item.type]}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{item.title}</span>
                          {item.subtitle && <span className="text-xs text-gray-400 truncate block">{item.subtitle}</span>}
                        </div>
                        {idx === selected && (
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-brand-400 shrink-0">
                            <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 01-4 4H4" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Quick Navigation</p>
              {PAGES.slice(0, 8).map((page, i) => (
                <button
                  key={page.id}
                  onClick={() => handleSelect(page)}
                  onMouseEnter={() => setSelected(i)}
                  className={`flex items-center gap-3 w-full px-5 py-2.5 text-left text-sm transition-colors ${
                    i === selected
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span className={i === selected ? "text-brand-500" : "text-gray-400"}>{ICONS.page}</span>
                  <span className="font-medium">{page.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-medium">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-medium">↵</kbd>
              Open
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 font-medium">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
