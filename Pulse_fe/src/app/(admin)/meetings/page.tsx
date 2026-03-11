"use client";
import React, { useEffect, useState, useCallback } from "react";
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
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", agenda: "", startTime: "", endTime: "", participantIds: [] as string[] });
  const slug = "pulse-demo";

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [m, mem] = await Promise.all([meetingService.getAll(slug), roleService.getMembers(slug)]);
      setMeetings(m); setMembers(mem);
    } catch {} setLoading(false);
  }, [slug]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setCreating(true);
    try { await meetingService.create(slug, form); setShowCreate(false); setForm({ title: "", description: "", agenda: "", startTime: "", endTime: "", participantIds: [] }); await fetch(); } catch {}
    setCreating(false);
  };

  const toggleParticipant = (id: string) => {
    setForm({ ...form, participantIds: form.participantIds.includes(id) ? form.participantIds.filter(p => p !== id) : [...form.participantIds, id] });
  };

  const formatDate = (d: string) => new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Schedule and manage meetings</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
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
              <div key={m.id} className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Meeting</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sprint Review" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start *</label><input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End *</label><input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agenda</label><textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} rows={2} placeholder="Meeting agenda..." className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none resize-none" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Participants</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {members.map((m) => (
                    <button key={m.id} onClick={() => toggleParticipant(m.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-gray-50 dark:hover:bg-gray-800 ${form.participantIds.includes(m.id) ? "bg-brand-50 dark:bg-brand-500/10" : ""}`}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-brand-500 shrink-0">{m.firstName?.charAt(0)}{m.lastName?.charAt(0)}</div>
                      <span className="flex-1 text-left text-gray-700 dark:text-gray-300">{m.firstName} {m.lastName}</span>
                      {form.participantIds.includes(m.id) && <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !form.title.trim() || !form.startTime || !form.endTime} className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
