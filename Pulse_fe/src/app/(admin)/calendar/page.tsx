"use client";
import React, { useEffect, useState, useCallback } from "react";
import { calendarService, CalendarEvent, CreateCalendarEventRequest } from "@/services/calendarService";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface CalItem { id: string; title: string; type: "event" | "deadline"; day: number; }

export default function CalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [items, setItems] = useState<CalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", isAllDay: true, location: "" });
  const [creating, setCreating] = useState(false);
  const slug = "pulse-demo";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await calendarService.getEvents(slug, month, year);
      const all: CalItem[] = [];
      [...(data.events || []), ...(data.deadlines || [])].forEach((e) => {
        const day = new Date(e.startTime).getDate();
        all.push({ id: e.id, title: e.title, type: e.type, day });
      });
      setItems(all);
    } catch { /* ignore */ }
    setLoading(false);
  }, [slug, month, year]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };
  const goToday = () => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); };

  const handleCreate = async () => {
    if (!newEvent.title.trim() || !selectedDay) return;
    setCreating(true);
    const startTime = new Date(year, month - 1, selectedDay, 9, 0).toISOString();
    const endTime = new Date(year, month - 1, selectedDay, 10, 0).toISOString();
    try {
      await calendarService.createEvent(slug, { ...newEvent, startTime, endTime });
      setShowCreate(false);
      setNewEvent({ title: "", description: "", isAllDay: true, location: "" });
      await fetchEvents();
    } catch { /* ignore */ }
    setCreating(false);
  };

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) => d === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View events and task deadlines</p>
        </div>
        <button onClick={() => { setShowCreate(true); setSelectedDay(now.getDate()); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Event
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-3">
        <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{MONTH_NAMES[month - 1]} {year}</h2>
          <button onClick={goToday} className="px-2.5 py-1 text-xs font-medium text-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 rounded-lg">
            Today
          </button>
        </div>
        <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              const dayItems = day ? items.filter((it) => it.day === day) : [];
              return (
                <div key={i}
                  onClick={() => { if (day) { setSelectedDay(day); setShowCreate(true); } }}
                  className={`min-h-[90px] sm:min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!day ? "bg-gray-50/50 dark:bg-gray-900/50" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dayItems.slice(0, 3).map((it) => (
                          <div key={it.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${it.type === "deadline" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"}`}>
                            {it.title}
                          </div>
                        ))}
                        {dayItems.length > 3 && (
                          <div className="text-[10px] text-gray-400 px-1">+{dayItems.length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Deadlines</span>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                New Event — {MONTH_NAMES[month - 1]} {selectedDay}, {year}
              </h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Meeting, Review..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={2} placeholder="Optional details..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Office, Zoom link..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !newEvent.title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50 flex items-center gap-2">
                {creating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
