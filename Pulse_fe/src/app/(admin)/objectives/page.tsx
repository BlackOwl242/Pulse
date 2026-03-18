"use client";
import React, { useEffect, useState, useCallback } from "react";
import { okrService, OKRObjective, CreateObjectiveRequest } from "@/services/okrService";
import { useSlug } from '@/hooks/useSlug';

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: "Draft", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  1: { label: "Active", cls: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  2: { label: "At Risk", cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  3: { label: "Completed", cls: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
  4: { label: "Cancelled", cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
};

const CONFIDENCE_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: "On Track", cls: "text-green-500" },
  1: { label: "At Risk", cls: "text-amber-500" },
  2: { label: "Off Track", cls: "text-red-500" },
};

function AlignmentTree({ objectives }: { objectives: OKRObjective[] }) {
  if (objectives.length === 0) return <div className="p-8 text-center text-sm text-gray-400">No objectives to display</div>;
  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex flex-col items-center min-w-[600px]">
        {/* Workspace root */}
        <div className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/20 mb-4">
          Workspace Goals
        </div>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        {/* Horizontal connector */}
        {objectives.length > 1 && (
          <div className="relative w-full flex justify-center">
            <div className="absolute top-0 h-px bg-gray-300 dark:bg-gray-600" style={{
              left: `${50 / objectives.length}%`,
              right: `${50 / objectives.length}%`,
            }} />
          </div>
        )}
        {/* Objectives row */}
        <div className="flex gap-6 justify-center flex-wrap">
          {objectives.map((obj) => {
            const status = STATUS_MAP[obj.status] || STATUS_MAP[0];
            return (
              <div key={obj.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                <div className="w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                    {obj.period && <span className="text-[10px] text-gray-400">{obj.period}</span>}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">{obj.title}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${obj.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-500">{Math.round(obj.progress)}%</span>
                  </div>
                </div>
                {/* KR children */}
                {obj.keyResults.length > 0 && (
                  <>
                    <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                    <div className="flex gap-3 flex-wrap justify-center">
                      {obj.keyResults.map((kr) => (
                        <div key={kr.id} className="flex flex-col items-center">
                          <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
                          <div className="w-48 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3">
                            <p className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 line-clamp-2">{kr.title}</p>
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${kr.progress >= 100 ? "bg-green-500" : kr.progress >= 50 ? "bg-brand-500" : "bg-amber-500"}`} style={{ width: `${Math.min(kr.progress, 100)}%` }} />
                              </div>
                              <span className="text-[9px] text-gray-400">{kr.currentValue}/{kr.targetValue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OKRPage() {
  const [objectives, setObjectives] = useState<OKRObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<CreateObjectiveRequest>({ title: "", period: "", status: 1 });
  const [krForm, setKrForm] = useState<{ objectiveId: string; title: string; targetValue: number; unit: string } | null>(null);
  const [checkInForm, setCheckInForm] = useState<{ krId: string; newValue: number; note: string; confidence: number } | null>(null);
  const [deletingObjId, setDeletingObjId] = useState<string | null>(null);
  const [deletingKrId, setDeletingKrId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "tree">("list");
  const slug = useSlug();

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setObjectives(await okrService.getAll(slug)); } catch {}
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggle = (id: string) => setExpanded({ ...expanded, [id]: !expanded[id] });

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await okrService.create(slug, form);
      setShowCreate(false);
      setForm({ title: "", period: "", status: 1 });
      await fetch();
    } catch {}
    setCreating(false);
  };

  const handleAddKR = async () => {
    if (!krForm || !krForm.title.trim()) return;
    try {
      await okrService.addKeyResult(slug, krForm.objectiveId, { title: krForm.title, targetValue: krForm.targetValue, unit: krForm.unit });
      setKrForm(null);
      await fetch();
    } catch {}
  };

  const handleCheckIn = async () => {
    if (!checkInForm) return;
    try {
      await okrService.checkIn(slug, checkInForm.krId, { newValue: checkInForm.newValue, note: checkInForm.note, confidence: checkInForm.confidence });
      setCheckInForm(null);
      await fetch();
    } catch {}
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, objId: string) => {
    e.stopPropagation();
    const newStatus = Number(e.target.value);
    setObjectives(prev => prev.map(o => o.id === objId ? { ...o, status: newStatus } : o));
    try {
      await okrService.updateObjective(slug, objId, { status: newStatus });
    } catch {
      await fetch();
    }
  };

  const handleDeleteObj = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this Objective and all its Key Results?")) return;
    setDeletingObjId(id);
    try { await okrService.deleteObjective(slug, id); await fetch(); } catch {}
    setDeletingObjId(null);
  };

  const handleDeleteKR = async (e: React.MouseEvent, krId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this Key Result?")) return;
    setDeletingKrId(krId);
    try { await okrService.deleteKeyResult(slug, krId); await fetch(); } catch {}
    setDeletingKrId(null);
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OKR — Objectives</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track objectives and key results</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "list" ? "text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
              List
            </button>
            <button onClick={() => setViewMode("tree")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "tree" ? "text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-900 shadow-sm" : "text-gray-500 dark:text-gray-400"}`}>
              Tree
            </button>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            New Objective
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : objectives.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10">
            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
          </div>
          <h3 className="font-semibold text-gray-800 dark:text-white/90">No objectives yet</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first OKR to start tracking progress</p>
        </div>
      ) : viewMode === "tree" ? (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
          <AlignmentTree objectives={objectives} />
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((obj) => {
            const status = STATUS_MAP[obj.status] || STATUS_MAP[0];
            const isOpen = expanded[obj.id];
            return (
              <div key={obj.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
                {/* Objective header */}
                <div className="px-5 py-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors" onClick={() => toggle(obj.id)}>
                  <div className="flex items-center gap-3">
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{obj.title}</h3>
                        
                        {/* Inline Status Edit Dropdown */}
                        <div className="relative isolate" onClick={e => e.stopPropagation()}>
                          <select
                            value={obj.status}
                            onChange={(e) => handleStatusChange(e, obj.id)}
                            className={`text-xs px-2 py-0.5 pr-6 rounded-full font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${status.cls}`}
                            title="Change status"
                          >
                            {Object.entries(STATUS_MAP).map(([key, val]) => (
                              <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{val.label}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none">
                            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>

                        {obj.period && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{obj.period}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden max-w-xs">
                          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${obj.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500">{Math.round(obj.progress)}%</span>
                        <span className="text-xs text-gray-400">{obj.keyResults.length} KR{obj.keyResults.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    {/* Delete Objective button */}
                    <button onClick={(e) => handleDeleteObj(e, obj.id)}
                            disabled={deletingObjId === obj.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                            title="Delete objective">
                       {deletingObjId === obj.id ? (
                           <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                       ) : (
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                       )}
                    </button>
                  </div>
                </div>

                {/* Key Results */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    {obj.keyResults.map((kr) => {
                      const pct = kr.progress;
                      return (
                        <div key={kr.id} className="flex items-center gap-3 px-5 py-3 pl-12 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{kr.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden max-w-[200px]">
                                <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-green-500" : pct >= 50 ? "bg-brand-500" : "bg-amber-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className="text-xs text-gray-400">{kr.currentValue}/{kr.targetValue} {kr.unit || ""}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setCheckInForm({ krId: kr.id, newValue: kr.currentValue, note: "", confidence: 0 }); }}
                              className="px-2.5 py-1 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg shrink-0">
                              Check-in
                            </button>
                            <button onClick={(e) => handleDeleteKR(e, kr.id)}
                                    disabled={deletingKrId === kr.id}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                                    title="Delete Key Result">
                               {deletingKrId === kr.id ? (
                                   <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                               ) : (
                                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                               )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="px-5 py-2 pl-12">
                      <button onClick={() => setKrForm({ objectiveId: obj.id, title: "", targetValue: 100, unit: "" })}
                        className="text-xs text-brand-500 hover:text-brand-600 font-medium">+ Add Key Result</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Objective Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Objective</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Increase user engagement" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label><input type="text" value={form.period || ""} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g. Q1-2026" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional details..." className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" /></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add KR Modal */}
      {krForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Key Result</h2>
              <button onClick={() => setKrForm(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={krForm.title} onChange={(e) => setKrForm({ ...krForm, title: e.target.value })} placeholder="e.g. Reach 10K DAU" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label><input type="number" value={krForm.targetValue} onChange={(e) => setKrForm({ ...krForm, targetValue: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label><input type="text" value={krForm.unit} onChange={(e) => setKrForm({ ...krForm, unit: e.target.value })} placeholder="e.g. %, users" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setKrForm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleAddKR} disabled={!krForm.title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {checkInForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Check-in</h2>
              <button onClick={() => setCheckInForm(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Value</label><input type="number" value={checkInForm.newValue} onChange={(e) => setCheckInForm({ ...checkInForm, newValue: Number(e.target.value) })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confidence</label>
                <div className="flex gap-2">
                  {Object.entries(CONFIDENCE_MAP).map(([key, val]) => (
                    <button key={key} onClick={() => setCheckInForm({ ...checkInForm, confidence: Number(key) })}
                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${checkInForm.confidence === Number(key) ? `${val.cls} border-current bg-current/10` : "border-gray-200 dark:border-gray-700 text-gray-500"}`}>{val.label}</button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note</label><textarea value={checkInForm.note} onChange={(e) => setCheckInForm({ ...checkInForm, note: e.target.value })} rows={2} placeholder="Optional note..." className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none resize-none" /></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setCheckInForm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCheckIn} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
