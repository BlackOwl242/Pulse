"use client";
import React, { useEffect, useState, useCallback } from "react";
import { plannerService, PlannerBlock } from "@/services/plannerService";

const BLOCK_COLORS: Record<number, { bg: string; border: string; text: string; label: string }> = {
  0: { bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-200 dark:border-brand-500/30", text: "text-brand-700 dark:text-brand-300", label: "Task" },
  1: { bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/30", text: "text-purple-700 dark:text-purple-300", label: "Meeting" },
  2: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", text: "text-amber-700 dark:text-amber-300", label: "Personal" },
  3: { bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/30", text: "text-green-700 dark:text-green-300", label: "Break" },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

export default function PlannerPage() {
  const [blocks, setBlocks] = useState<PlannerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "", type: 0 as number });
  const slug = "pulse-demo";

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setBlocks(await plannerService.getBlocks(slug, date)); } catch {}
    setLoading(false);
  }, [slug, date]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.title?.trim() || !form.startTime || !form.endTime) return;
    setCreating(true);
    try {
      await plannerService.create(slug, { title: form.title, startTime: `${date}T${form.startTime}`, endTime: `${date}T${form.endTime}`, type: form.type });
      setShowCreate(false); setForm({ title: "", startTime: "", endTime: "", type: 0 });
      await fetch();
    } catch {} setCreating(false);
  };

  const handleDelete = async (id: string) => {
    try { await plannerService.remove(slug, id); await fetch(); } catch {}
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const dayLabel = new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const getBlockPosition = (block: PlannerBlock) => {
    const start = new Date(block.startTime);
    const end = new Date(block.endTime);
    const startHr = start.getHours() + start.getMinutes() / 60;
    const endHr = end.getHours() + end.getMinutes() / 60;
    return { top: `${((startHr - 7) / 13) * 100}%`, height: `${((endHr - startHr) / 13) * 100}%` };
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Planner</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-1">
            <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d.toISOString().split("T")[0]); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setDate(new Date().toISOString().split("T")[0])} className="px-2 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded">Today</button>
            <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d.toISOString().split("T")[0]); }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Block
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
          <div className="relative" style={{ height: "700px" }}>
            {/* Time grid */}
            {HOURS.map((h) => (
              <div key={h} className="absolute w-full flex items-start border-t border-gray-100 dark:border-gray-800/50" style={{ top: `${((h - 7) / 13) * 100}%`, height: `${(1 / 13) * 100}%` }}>
                <span className="text-[10px] text-gray-400 w-14 pl-3 pt-0.5 shrink-0">{h.toString().padStart(2, "0")}:00</span>
              </div>
            ))}

            {/* Blocks */}
            <div className="absolute inset-0 left-14 right-3">
              {blocks.map((block) => {
                const color = BLOCK_COLORS[block.type] || BLOCK_COLORS[0];
                const pos = getBlockPosition(block);
                return (
                  <div key={block.id} className={`absolute left-1 right-1 px-3 py-1.5 rounded-lg border ${color.bg} ${color.border} overflow-hidden cursor-default group`}
                    style={{ top: pos.top, height: pos.height, minHeight: "30px" }}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${color.text}`}>{block.title || block.task?.title}</p>
                        <p className="text-[10px] text-gray-400">{formatTime(block.startTime)} – {formatTime(block.endTime)}</p>
                      </div>
                      <button onClick={() => handleDelete(block.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <span className={`text-[9px] font-medium ${color.text} opacity-60`}>{color.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Time Block</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Deep work session" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start</label><input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End</label><input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <div className="flex gap-2">
                  {Object.entries(BLOCK_COLORS).map(([key, val]) => (
                    <button key={key} onClick={() => setForm({ ...form, type: Number(key) })}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${form.type === Number(key) ? `${val.bg} ${val.border} ${val.text}` : "border-gray-200 dark:border-gray-700 text-gray-500"}`}>{val.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title?.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}Add Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
