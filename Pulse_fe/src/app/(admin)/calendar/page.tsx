"use client";
import React, { useEffect, useState, useCallback } from "react";
import DateTimePicker from "@/components/ui/DateTimePicker";
import api from "@/services/api";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface CalItem {
  id: string; title: string; description?: string;
  startTime: string; endTime: string; isAllDay: boolean;
  type: "event" | "deadline" | "meeting" | "planner";
  color: string;
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; dot: string; bg: string; text: string }> = {
  event:    { label: "Event",    emoji: "📅", dot: "bg-brand-500",  bg: "bg-brand-50 dark:bg-brand-500/10",  text: "text-brand-600 dark:text-brand-400" },
  deadline: { label: "Deadline", emoji: "📋", dot: "bg-amber-500",  bg: "bg-amber-50 dark:bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400" },
  meeting:  { label: "Meeting",  emoji: "🤝", dot: "bg-green-500",  bg: "bg-green-50 dark:bg-green-500/10",  text: "text-green-600 dark:text-green-400" },
  planner:  { label: "Planner",  emoji: "⏰", dot: "bg-red-500",    bg: "bg-red-50 dark:bg-red-500/10",      text: "text-red-600 dark:text-red-400" },
};

export default function CalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [items, setItems] = useState<CalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const slug = "pulse-demo";

  // Day detail modal
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayItems, setDayItems] = useState<CalItem[]>([]);

  // Create event modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newEvent, setNewEvent] = useState({ title: "", description: "", startTime: "", endTime: "", isAllDay: true, location: "" });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<CalItem[]>(`/workspaces/${slug}/calendar`, { params: { month, year } });
      setItems(res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, month, year]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1); };
  const goToday = () => { setMonth(now.getMonth() + 1); setYear(now.getFullYear()); };

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isToday = (d: number) => d === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  const getItemsForDay = (day: number): CalItem[] => {
    return items.filter((it) => {
      const itemDay = new Date(it.startTime).getDate();
      const itemMonth = new Date(it.startTime).getMonth() + 1;
      const itemYear = new Date(it.startTime).getFullYear();
      return itemDay === day && itemMonth === month && itemYear === year;
    });
  };

  const openDayModal = (day: number) => {
    setSelectedDay(day);
    setDayItems(getItemsForDay(day));
    setDayModalOpen(true);
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleCreate = async () => {
    setCreateError("");
    if (!newEvent.title.trim()) { setCreateError("Title is required"); return; }
    if (!newEvent.startTime) { setCreateError("Start date is required"); return; }
    if (!newEvent.endTime) { setCreateError("End date is required"); return; }
    if (newEvent.endTime < newEvent.startTime) { setCreateError("End must be after start"); return; }
    setCreating(true);
    try {
      const startTime = newEvent.startTime.includes("T") ? newEvent.startTime + ":00" : newEvent.startTime + "T00:00:00";
      const endTime = newEvent.endTime.includes("T") ? newEvent.endTime + ":00" : newEvent.endTime + "T00:00:00";
      import("@/services/calendarService").then(async ({ calendarService }) => {
        await calendarService.createEvent(slug, {
          title: newEvent.title, description: newEvent.description,
          startTime, endTime, isAllDay: newEvent.isAllDay, location: newEvent.location,
        });
        setShowCreate(false);
        setNewEvent({ title: "", description: "", startTime: "", endTime: "", isAllDay: true, location: "" });
        setCreateError("");
        await fetchItems();
      });
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Failed to create event");
    } finally { setCreating(false); }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this event?")) {
      setDeletingId(id);
      try {
        const { calendarService } = await import("@/services/calendarService");
        await calendarService.deleteEvent(slug, id);
        // Remove from local state immediately for snappy UI
        setItems(prev => prev.filter(it => it.id !== id));
        setDayItems(prev => prev.filter(it => it.id !== id));
      } catch { /* ignore */ }
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All events, meetings, deadlines & planner blocks</p>
        </div>
        <button onClick={() => setShowCreate(true)}
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
          <button onClick={goToday} className="px-2.5 py-1 text-xs font-medium text-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 rounded-lg">Today</button>
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
              const cellItems = day ? getItemsForDay(day) : [];
              return (
                <div key={i}
                  onClick={() => { if (day) openDayModal(day); }}
                  className={`min-h-[90px] sm:min-h-[100px] border-b border-r border-gray-100 dark:border-gray-800 p-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${!day ? "bg-gray-50/50 dark:bg-gray-900/50" : ""}`}
                >
                  {day && (
                    <>
                      <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-300"}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {cellItems.slice(0, 3).map((it) => {
                          const cfg = TYPE_CONFIG[it.type] || TYPE_CONFIG.event;
                          return (
                            <div key={it.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate ${cfg.bg} ${cfg.text}`}>
                              {it.title.replace(/^[📋🤝⏰📅]\s*/, "")}
                            </div>
                          );
                        })}
                        {cellItems.length > 3 && (
                          <div className="text-[10px] text-gray-400 px-1">+{cellItems.length - 3} more</div>
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
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${cfg.dot}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* ===== DAY DETAIL MODAL ===== */}
      {dayModalOpen && selectedDay && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDayModalOpen(false)}>
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(year, month - 1, selectedDay).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dayItems.length} item{dayItems.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setDayModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {dayItems.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No items on this day</p>
                  <button onClick={() => { setDayModalOpen(false); setShowCreate(true); }}
                    className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-medium">+ Add an event</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayItems.map((item) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
                    return (
                      <div key={item.id} className={`rounded-xl border p-4 ${cfg.bg} border-transparent`}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{cfg.emoji}</span>
                          <div className="flex-1 min-w-0 pr-6 relative">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${cfg.text} opacity-70`}>{cfg.label}</span>
                            <p className={`text-sm font-semibold leading-snug ${cfg.text}`}>{item.title.replace(/^[📋🤝⏰📅]\s*/, "")}</p>
                            {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
                            {!item.isAllDay && (
                              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {formatTime(item.startTime)} – {formatTime(item.endTime)}
                              </p>
                            )}
                            {/* Delete button only for standard calendar events */}
                            {item.type === "event" && (
                              <button
                                onClick={(e) => handleDeleteEvent(e, item.id)}
                                disabled={deletingId === item.id}
                                className="absolute top-0 right-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete event"
                              >
                                {deletingId === item.id ? (
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {dayItems.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800">
                <button onClick={() => { setDayModalOpen(false); setShowCreate(true); }}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium">+ Add event on this day</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CREATE EVENT MODAL ===== */}
      {showCreate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Event</h2>
              <button onClick={() => { setShowCreate(false); setCreateError(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {createError && (
                <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  {createError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Meeting, Review..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DateTimePicker label="Start *" value={newEvent.startTime} onChange={(v) => setNewEvent({ ...newEvent, startTime: v })} placeholder="Select start" />
                <DateTimePicker label="End *" value={newEvent.endTime} onChange={(v) => setNewEvent({ ...newEvent, endTime: v })} placeholder="Select end" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} rows={2} placeholder="Optional details..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Office, Zoom link..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => { setShowCreate(false); setCreateError(""); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
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
