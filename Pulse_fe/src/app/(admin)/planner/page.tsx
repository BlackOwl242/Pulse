"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { plannerService, PlannerBlock } from "@/services/plannerService";

const BLOCK_COLORS: Record<number, { bg: string; border: string; text: string; dot: string; label: string }> = {
  0: { bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-200 dark:border-brand-500/30", text: "text-brand-700 dark:text-brand-300", dot: "bg-brand-500", label: "Task" },
  1: { bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500", label: "Meeting" },
  2: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500", label: "Personal" },
  3: { bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500", label: "Break" },
};

export default function PlannerPage() {
  const [blocks, setBlocks] = useState<PlannerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { m: d.getMonth(), y: d.getFullYear() }; });
  const calRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "", type: 0 as number });
  const slug = "pulse-demo";

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      setBlocks(await plannerService.getBlocks(slug, date));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, date]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const validateForm = (): boolean => {
    setFormError("");
    if (!form.title?.trim()) { setFormError("Title is required"); return false; }
    if (!form.startTime) { setFormError("Start time is required"); return false; }
    if (!form.endTime) { setFormError("End time is required"); return false; }
    if (form.startTime >= form.endTime) { setFormError("End time must be after start time"); return false; }
    // Check for overlap with existing blocks
    const newStart = form.startTime;
    const newEnd = form.endTime;
    const overlap = blocks.find((b) => {
      const bStart = formatTimeLocal(b.startTime);
      const bEnd = formatTimeLocal(b.endTime);
      return newStart < bEnd && newEnd > bStart;
    });
    if (overlap) { setFormError(`Overlaps with "${overlap.title || overlap.task?.title}" (${formatTimeLocal(overlap.startTime)} – ${formatTimeLocal(overlap.endTime)})`); return false; }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setCreating(true);
    try {
      await plannerService.create(slug, {
        title: form.title,
        startTime: `${date}T${form.startTime}:00`,
        endTime: `${date}T${form.endTime}:00`,
        type: form.type,
      });
      setShowCreate(false);
      setForm({ title: "", startTime: "", endTime: "", type: 0 });
      setFormError("");
      await fetchBlocks();
    } catch { setFormError("Failed to create block. Please try again."); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      try {
        await plannerService.remove(slug, id);
        setConfirmDeleteId(null);
        setExpandedId(null);
        await fetchBlocks();
      } catch { /* ignore */ }
    } else {
      setConfirmDeleteId(id);
    }
  };

  // Format time string using UTC to avoid timezone shift
  // (backend stores user's intended local time as UTC)
  const formatTimeLocal = (d: string) => {
    const dt = new Date(d);
    return `${dt.getUTCHours().toString().padStart(2, "0")}:${dt.getUTCMinutes().toString().padStart(2, "0")}`;
  };

  // Format with h:mm display
  const formatTimeDisplay = (d: string) => {
    const dt = new Date(d);
    const h = dt.getUTCHours();
    const m = dt.getUTCMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  // Calculate duration in minutes
  const getDuration = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
    const h = Math.floor(diff / 60);
    const m = Math.round(diff % 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const dayLabel = new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const isToday = date === new Date().toISOString().split("T")[0];
  const sortedBlocks = [...blocks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Planner</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {dayLabel}
            {isToday && <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">TODAY</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-1">
            <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split("T")[0]); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="relative" ref={calRef}>
              <button onClick={() => { setShowCalendar(!showCalendar); const d = new Date(date); setCalMonth({ m: d.getMonth(), y: d.getFullYear() }); }}
                className="px-2.5 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                Pick Date
              </button>
              {showCalendar && (() => {
                const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
                const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
                const todayStr = new Date().toISOString().split("T")[0];
                const days: (number | null)[] = Array.from({ length: firstDay }, () => null);
                for (let i = 1; i <= daysInMonth; i++) days.push(i);
                const monthLabel = new Date(calMonth.y, calMonth.m).toLocaleDateString(undefined, { month: "long", year: "numeric" });
                return (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 w-72">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setCalMonth((p) => p.m === 0 ? { m: 11, y: p.y - 1 } : { m: p.m - 1, y: p.y })}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{monthLabel}</span>
                      <button onClick={() => setCalMonth((p) => p.m === 11 ? { m: 0, y: p.y + 1 } : { m: p.m + 1, y: p.y })}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                        <span key={d} className="text-[10px] font-medium text-gray-400 py-1">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {days.map((day, i) => {
                        if (day === null) return <span key={`e${i}`} />;
                        const dayStr = `${calMonth.y}-${(calMonth.m + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                        const isSelected = dayStr === date;
                        const isToday2 = dayStr === todayStr;
                        return (
                          <button key={day} onClick={() => { setDate(dayStr); setShowCalendar(false); }}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors mx-auto flex items-center justify-center
                              ${isSelected ? "bg-brand-500 text-white" : isToday2 ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                      <button onClick={() => { setDate(todayStr); setShowCalendar(false); }}
                        className="text-xs font-medium text-brand-500 hover:underline">Go to today</button>
                    </div>
                  </div>
                );
              })()}
            </div>
            <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d.toISOString().split("T")[0]); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <button onClick={() => { setShowCreate(true); setFormError(""); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Block
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Blocks</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{blocks.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled Time</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {blocks.length > 0
              ? getDuration(
                  blocks.reduce((a, b) => new Date(a.startTime) < new Date(b.startTime) ? a : b, blocks[0]).startTime,
                  blocks.reduce((a, b) => new Date(a.endTime) > new Date(b.endTime) ? a : b, blocks[0]).endTime
                )
              : "0h"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Block Types</p>
          <div className="flex items-center gap-2 mt-1">
            {Object.entries(BLOCK_COLORS).map(([key, val]) => {
              const count = blocks.filter((b) => b.type === Number(key)).length;
              if (count === 0) return null;
              return <span key={key} className={`inline-flex items-center gap-1 text-xs font-medium ${val.text}`}><span className={`w-2 h-2 rounded-full ${val.dot}`} />{count}</span>;
            })}
            {blocks.length === 0 && <span className="text-sm text-gray-300 dark:text-gray-600">—</span>}
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : sortedBlocks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10">
              <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">No blocks scheduled</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Add time blocks to plan your day. Blocks can be tasks, meetings, personal time, or breaks.</p>
            <button onClick={() => { setShowCreate(true); setFormError(""); }} className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors">Add Block</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedBlocks.map((block) => {
              const color = BLOCK_COLORS[block.type] || BLOCK_COLORS[0];
              const isExpanded = expandedId === block.id;
              return (
                <div key={block.id}
                  className={`transition-colors ${isExpanded ? color.bg : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"}`}>
                  {/* Main row */}
                  <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : block.id)}>
                    {/* Time column */}
                    <div className="w-28 shrink-0 text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatTimeDisplay(block.startTime)}</p>
                      <p className="text-xs text-gray-400">{formatTimeDisplay(block.endTime)}</p>
                    </div>
                    {/* Color bar */}
                    <div className={`w-1 self-stretch rounded-full ${color.dot} shrink-0`} />
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{block.title || block.task?.title || "Untitled"}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${color.bg} ${color.text} border ${color.border}`}>{color.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{getDuration(block.startTime, block.endTime)}</p>
                    </div>
                    {/* Expand indicator */}
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pl-[calc(7rem+1.25rem+4px)]">
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="text-gray-400">Start</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{formatTimeDisplay(block.startTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">End</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{formatTimeDisplay(block.endTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Duration</span>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{getDuration(block.startTime, block.endTime)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Type</span>
                          <p className={`font-medium ${color.text}`}>{color.label}</p>
                        </div>
                        {block.task && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Linked Task</span>
                            <p className="font-medium text-gray-700 dark:text-gray-300">{block.task.title}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === block.id ? (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(block.id); }}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">Delete</button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">Cancel</button>
                          </>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(block.id); }}
                            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Time Block</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Deep work session"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start *</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End *</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                </div>
              </div>
              {form.startTime && form.endTime && form.startTime < form.endTime && (
                <p className="text-xs text-gray-400">Duration: {(() => {
                  const [sh, sm] = form.startTime.split(":").map(Number);
                  const [eh, em] = form.endTime.split(":").map(Number);
                  const diff = (eh * 60 + em) - (sh * 60 + sm);
                  const h = Math.floor(diff / 60);
                  const m = diff % 60;
                  if (h === 0) return `${m} minutes`;
                  if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
                  return `${h}h ${m}m`;
                })()}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex gap-2">
                  {Object.entries(BLOCK_COLORS).map(([key, val]) => (
                    <button key={key} onClick={() => setForm({ ...form, type: Number(key) })}
                      className={`flex-1 px-3 py-2.5 text-xs font-medium rounded-lg border transition-all ${form.type === Number(key)
                        ? `${val.bg} ${val.border} ${val.text} ring-1 ring-current`
                        : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"}`}>
                      <span className={`inline-block w-2 h-2 rounded-full ${val.dot} mr-1.5`} />
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title?.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2 transition-colors">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Add Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
