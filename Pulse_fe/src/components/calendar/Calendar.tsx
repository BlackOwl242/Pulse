"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
import { useSlug } from '@/hooks/useSlug';
  EventInput,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import DateTimePicker from "@/components/ui/DateTimePicker";
import api from "@/services/api";

interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  type: "event" | "deadline" | "meeting" | "planner";
  color: string;
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; cls: string; fcColor: string }> = {
  event:    { label: "Event",    emoji: "📅", cls: "text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 border-brand-200 dark:border-brand-500/30",   fcColor: "primary" },
  deadline: { label: "Deadline", emoji: "📋", cls: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/30", fcColor: "warning" },
  meeting:  { label: "Meeting",  emoji: "🤝", cls: "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/30", fcColor: "success" },
  planner:  { label: "Planner",  emoji: "⏰", cls: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/30",             fcColor: "danger" },
};

const Calendar: React.FC = () => {
  const slug = useSlug();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => ({ m: new Date().getMonth() + 1, y: new Date().getFullYear() }));
  const calendarRef = useRef<FullCalendar>(null);

  // Add event modal
  const { isOpen, openModal, closeModal } = useModal();
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");

  // Day detail modal
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [dayItems, setDayItems] = useState<CalendarItem[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get<CalendarItem[]>(`/workspaces/${slug}/calendar`, {
        params: { month: currentMonth.m, year: currentMonth.y }
      });
      setItems(res.data);
    } catch { /* ignore */ }
  }, [slug, currentMonth]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Convert to FullCalendar events
  const fcEvents: EventInput[] = items.map((item) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
    return {
      id: item.id,
      title: item.title,
      start: item.startTime,
      end: item.endTime,
      allDay: item.isAllDay,
      extendedProps: { calendar: cfg.fcColor, type: item.type, description: item.description },
    };
  });

  const handleDateClick = (info: { dateStr: string }) => {
    showDayDetail(info.dateStr);
  };

  const showDayDetail = (dateStr: string) => {
    const targetDate = dateStr.split("T")[0];
    setSelectedDate(targetDate);
    const matching = items.filter((item) => {
      const itemDate = item.startTime.split("T")[0];
      return itemDate === targetDate;
    });
    setDayItems(matching);
    setDayModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    // Show the day detail for this event's date
    const dateStr = event.start?.toISOString().split("T")[0] || "";
    if (dateStr) showDayDetail(dateStr);
  };

  const handleMonthChange = (info: { start: Date; end: Date }) => {
    // FullCalendar gives us the visible range — use the middle to determine month
    const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
    const m = mid.getMonth() + 1;
    const y = mid.getFullYear();
    if (m !== currentMonth.m || y !== currentMonth.y) {
      setCurrentMonth({ m, y });
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !eventStartDate || !eventEndDate) return;
    try {
      await api.post(`/workspaces/${slug}/calendar`, {
        title: eventTitle,
        startTime: eventStartDate.includes("T") ? eventStartDate + ":00" : eventStartDate + "T00:00:00",
        endTime: eventEndDate.includes("T") ? eventEndDate + ":00" : eventEndDate + "T00:00:00",
        isAllDay: !eventStartDate.includes("T"),
      });
      closeModal();
      resetModalFields();
      await fetchItems();
    } catch { /* ignore */ }
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Primary");
  };

  const formatTime = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateDisplay = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const calendarsEvents: Record<string, string> = { Danger: "danger", Success: "success", Primary: "primary", Warning: "warning" };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={fcEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleMonthChange}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Add Event +",
              click: openModal,
            },
          }}
        />
      </div>

      {/* Add Event Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">Add Event</h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new calendar event</p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Event Title</label>
              <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" />
            </div>
            <div>
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">Event Color</label>
              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
                {Object.entries(calendarsEvents).map(([key, value]) => (
                  <label key={key} className="flex items-center text-sm text-gray-700 dark:text-gray-400 cursor-pointer">
                    <span className="relative mr-2">
                      <input type="radio" name="event-level" value={key} checked={eventLevel === key} onChange={() => setEventLevel(key)}
                        className="sr-only" />
                      <span className="flex items-center justify-center w-5 h-5 border border-gray-300 rounded-full dark:border-gray-700">
                        <span className={`h-2 w-2 rounded-full bg-white ${eventLevel === key ? "block" : "hidden"}`} />
                      </span>
                    </span>
                    {key}
                  </label>
                ))}
              </div>
            </div>
            <DateTimePicker label="Start Date" value={eventStartDate} onChange={setEventStartDate} placeholder="Select start date" />
            <DateTimePicker label="End Date" value={eventEndDate} onChange={setEventEndDate} placeholder="Select end date" />
          </div>
          <div className="flex items-center gap-3 mt-6 sm:justify-end">
            <button onClick={closeModal} className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto">Close</button>
            <button onClick={handleAddEvent} className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto">Add Event</button>
          </div>
        </div>
      </Modal>

      {/* Day Detail Modal */}
      {dayModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDayModalOpen(false)}>
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formatDateDisplay(selectedDate)}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dayItems.length} item{dayItems.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setDayModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
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
                  <button onClick={() => { setDayModalOpen(false); openModal(); setEventStartDate(selectedDate); setEventEndDate(selectedDate); }}
                    className="mt-3 text-sm text-brand-500 hover:text-brand-600 font-medium">+ Add an event</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayItems.map((item) => {
                    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.event;
                    return (
                      <div key={item.id} className={`rounded-xl border p-4 ${cfg.cls}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{cfg.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{cfg.label}</span>
                            </div>
                            <p className="text-sm font-semibold leading-snug">{item.title.replace(/^[📋🤝⏰📅]\s*/, "")}</p>
                            {item.description && <p className="text-xs opacity-70 mt-1 line-clamp-2">{item.description}</p>}
                            {!item.isAllDay && (
                              <p className="text-xs opacity-70 mt-1.5 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {formatTime(item.startTime)} – {formatTime(item.endTime)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar?.toLowerCase() || "primary"}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
