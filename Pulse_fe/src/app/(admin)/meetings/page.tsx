"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import DateTimePicker from "@/components/ui/DateTimePicker";
import { meetingService, Meeting } from "@/services/meetingService";
import { roleService } from "@/services/roleService";
import { WorkspaceMember } from "@/types/roles";

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: "Proposed", cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
  1: { label: "Confirmed", cls: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  2: { label: "Cancelled", cls: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" },
};
const RSVP: Record<number, { label: string; cls: string }> = {
  0: { label: "Pending", cls: "text-gray-400" }, 1: { label: "Accepted", cls: "text-green-500" },
  2: { label: "Declined", cls: "text-red-500" }, 3: { label: "Tentative", cls: "text-amber-500" },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ title: "", description: "", agenda: "", startTime: "", endTime: "", participantIds: [] as string[] });
  const [showParticipantPicker, setShowParticipantPicker] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const participantInputRef = useRef<HTMLInputElement>(null);
  const slug = "pulse-demo";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [m, mem] = await Promise.all([meetingService.getAll(slug), roleService.getMembers(slug)]);
      setMeetings(m); setMembers(mem);
    } catch {} finally { setLoading(false); }
  }, [slug]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setFormError("");
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.startTime) { setFormError("Start time is required"); return; }
    if (!form.endTime) { setFormError("End time is required"); return; }
    if (form.endTime <= form.startTime) { setFormError("End time must be after start time"); return; }
    setCreating(true);
    try {
      if (editingMeetingId) {
        await meetingService.update(slug, editingMeetingId, form);
      } else {
        await meetingService.create(slug, form);
      }
      setShowModal(false);
      setEditingMeetingId(null);
      setForm({ title: "", description: "", agenda: "", startTime: "", endTime: "", participantIds: [] });
      setFormError("");
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to ${editingMeetingId ? 'update' : 'create'} meeting`;
      setFormError(msg);
    } finally { setCreating(false); }
  };

  const openCreateModal = () => {
    setEditingMeetingId(null);
    setForm({ title: "", description: "", agenda: "", startTime: "", endTime: "", participantIds: [] });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (m: Meeting) => {
    setEditingMeetingId(m.id);
    setForm({
      title: m.title,
      description: m.description || "",
      agenda: m.agenda || "",
      startTime: m.proposedStartTime.split(".")[0], // Trim subseconds for datetime-local input
      endTime: m.proposedEndTime.split(".")[0],
      participantIds: m.participants.filter(p => p.userId !== m.organizer.id).map(p => p.userId)
    });
    setFormError("");
    setShowModal(true);
  };

  const toggleParticipant = (id: string) => {
    setForm({ ...form, participantIds: form.participantIds.includes(id) ? form.participantIds.filter(p => p !== id) : [...form.participantIds, id] });
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return; }
    try { await meetingService.cancel(slug, id); setConfirmDeleteId(null); await fetchData(); } catch {}
  };

  const formatDate = (d: string) => new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Schedule and manage meetings</p>
        </div>
        <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Schedule Meeting
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          </div>
          <p className="font-semibold text-gray-800 dark:text-white/90">No meetings scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const status = STATUS_MAP[m.status] || STATUS_MAP[0];
            return (
              <div 
                  key={m.id} 
                  onClick={() => openEditModal(m)}
                  className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 cursor-pointer hover:border-brand-500 hover:shadow-sm transition-all relative group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase">{new Date(m.proposedStartTime).toLocaleDateString(undefined, { month: "short" })}</span>
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400 -mt-1">{new Date(m.proposedStartTime).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">{m.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {formatDate(m.proposedStartTime)} — {formatDate(m.proposedEndTime)} · Organized by {m.organizer.firstName}
                    </p>
                    {m.agenda && <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{m.agenda}</p>}
                    <div className="flex items-center gap-1.5">
                      {m.participants.slice(0, 5).map((p) => (
                        <div key={p.userId} title={`${p.user.firstName} ${p.user.lastName} — ${RSVP[p.responseStatus]?.label}`}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0 ring-2 ring-white dark:ring-gray-900 ${RSVP[p.responseStatus]?.cls === "text-red-500" ? "opacity-50" : ""}`}>
                          {p.user.firstName?.charAt(0)}{p.user.lastName?.charAt(0)}
                        </div>
                      ))}
                      {m.participants.length > 5 && <span className="text-xs text-gray-400 ml-1">+{m.participants.length - 5}</span>}
                    </div>
                  </div>
                  {/* Delete button */}
                  <div className="shrink-0 flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {confirmDeleteId === m.id ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleDelete(m.id)} className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete meeting">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[90vh] overflow-visible flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingMeetingId ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
              <button 
                onClick={() => { setShowModal(false); setEditingMeetingId(null); }} 
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
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
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sprint Review" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <DateTimePicker label="Start *" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} showTime placeholder="Select start" />
                <DateTimePicker label="End *" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} showTime placeholder="Select end" />
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</label><textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} rows={2} placeholder="Meeting agenda..." className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none resize-none" /></div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants</label>
                <div 
                  onClick={() => {
                    setShowParticipantPicker(!showParticipantPicker);
                    if (!showParticipantPicker) setTimeout(() => participantInputRef.current?.focus(), 100);
                  }}
                  className="w-full min-h-[40px] px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer hover:border-brand-500 transition-colors flex flex-wrap gap-2 items-center"
                >
                  {form.participantIds.length > 0 ? (
                    form.participantIds.map((id) => {
                      const m = members.find(x => x.userId === id);
                      if (!m) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md mb-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0">
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              `${m.firstName?.charAt(0)}${m.lastName?.charAt(0)}`
                            )}
                          </div>
                          <span className="text-xs font-medium">{m.firstName} {m.lastName}</span>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              toggleParticipant(id); 
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-gray-400 flex-1">Select participants</span>
                  )}
                  <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showParticipantPicker ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showParticipantPicker && (
                  <div className="absolute bottom-full left-0 w-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="relative">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          ref={participantInputRef}
                          type="text"
                          placeholder="Search participants..."
                          value={participantSearch}
                          onChange={(e) => setParticipantSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-transparent rounded-md focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {members.filter(m => 
                        `${m.firstName} ${m.lastName}`.toLowerCase().includes(participantSearch.toLowerCase()) || 
                        m.email.toLowerCase().includes(participantSearch.toLowerCase())
                      ).map((m) => {
                        const isSelected = form.participantIds.includes(m.userId);
                        return (
                          <button
                            key={m.userId}
                            onClick={() => { toggleParticipant(m.userId); }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${isSelected ? "bg-brand-50 dark:bg-brand-900/20" : ""}`}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-brand-500 shrink-0">
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSelected ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-white"}`}>
                                {m.firstName} {m.lastName}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{m.email}</p>
                            </div>
                            {isSelected && (
                              <svg className="w-4 h-4 text-brand-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                      {members.filter(m => 
                        `${m.firstName} ${m.lastName}`.toLowerCase().includes(participantSearch.toLowerCase()) || 
                        m.email.toLowerCase().includes(participantSearch.toLowerCase())
                      ).length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-3">No members found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 rounded-b-2xl">
              <button onClick={() => { setShowModal(false); setEditingMeetingId(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={creating || !form.title.trim() || !form.startTime || !form.endTime} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingMeetingId ? 'Save Changes' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
