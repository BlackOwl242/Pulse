"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// ──────────────────────────────────────────────
// DateTimePicker — reusable calendar dropdown
// ──────────────────────────────────────────────
//
// Props:
//   value        — ISO date string "YYYY-MM-DD" or datetime "YYYY-MM-DDTHH:mm"
//   onChange      — called with ISO string when user picks
//   showTime     — include hour/minute selector (default false)
//   placeholder  — placeholder text
//   label        — optional label above the input
//   className    — extra classes on the wrapper
//   disabled     — disable interaction

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  showTime?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Format a date string to d/MM/yyyy */
function formatDisplay(iso: string, showTime?: boolean): string {
  if (!iso) return "";
  const datePart = iso.includes("T") ? iso.split("T")[0] : iso;
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return iso;
  const formatted = `${parseInt(d)}/${m}/${y}`;
  if (showTime && iso.includes("T")) {
    const timePart = iso.split("T")[1] || "";
    const [hh, mm] = timePart.split(":");
    if (hh && mm) return `${formatted} ${hh}:${mm}`;
  }
  return formatted;
}

export default function DateTimePicker({
  value,
  onChange,
  showTime = false,
  placeholder = "Select date",
  label,
  className = "",
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse initial month from value
  const parseMonth = useCallback(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return { m: d.getMonth(), y: d.getFullYear() };
    }
    const now = new Date();
    return { m: now.getMonth(), y: now.getFullYear() };
  }, [value]);

  const [calMonth, setCalMonth] = useState(parseMonth);

  // Time state
  const getTimeParts = () => {
    if (value && value.includes("T")) {
      const t = value.split("T")[1] || "";
      const [h, m] = t.split(":");
      return { h: h || "00", m: m || "00" };
    }
    return { h: "00", m: "00" };
  };
  const [time, setTime] = useState(getTimeParts);

  // Sync calMonth when value changes externally
  useEffect(() => {
    setCalMonth(parseMonth());
    setTime(getTimeParts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Calendar data
  const todayStr = new Date().toISOString().split("T")[0];
  const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  const blanks: (number | null)[] = Array.from({ length: firstDay }, () => null);
  const days = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const monthLabel = new Date(calMonth.y, calMonth.m).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const selectedDate = value ? (value.includes("T") ? value.split("T")[0] : value) : "";

  const pickDate = (day: number) => {
    const dayStr = `${calMonth.y}-${(calMonth.m + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    if (showTime) {
      onChange(`${dayStr}T${time.h}:${time.m}`);
    } else {
      onChange(dayStr);
      setOpen(false);
    }
  };

  const updateTime = (h: string, m: string) => {
    setTime({ h, m });
    if (selectedDate) {
      onChange(`${selectedDate}T${h}:${m}`);
    }
  };

  const prevMonth = () => setCalMonth((p) => (p.m === 0 ? { m: 11, y: p.y - 1 } : { m: p.m - 1, y: p.y }));
  const nextMonth = () => setCalMonth((p) => (p.m === 11 ? { m: 0, y: p.y + 1 } : { m: p.m + 1, y: p.y }));

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { setOpen(!open); setCalMonth(parseMonth()); } }}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-lg transition-colors text-left
          ${open ? "border-brand-500 ring-2 ring-brand-500/20" : "border-gray-200 dark:border-gray-700"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"}
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
      >
        <span className={value ? "" : "text-gray-400"}>{value ? formatDisplay(value, showTime) : placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{monthLabel}</span>
            <button type="button" onClick={nextMonth} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {DAYS.map((d) => (
              <span key={d} className="text-[10px] font-medium text-gray-400 py-1">{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.map((day, i) => {
              if (day === null) return <span key={`e${i}`} />;
              const dayStr = `${calMonth.y}-${(calMonth.m + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
              const isSelected = dayStr === selectedDate;
              const isToday = dayStr === todayStr;
              return (
                <button key={day} type="button" onClick={() => pickDate(day)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors mx-auto flex items-center justify-center
                    ${isSelected ? "bg-brand-500 text-white" : isToday ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          {showTime && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs text-gray-500">Time:</span>
                <select value={time.h} onChange={(e) => updateTime(e.target.value, time.m)}
                  className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none">
                  {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-gray-400 font-bold">:</span>
                <select value={time.m} onChange={(e) => updateTime(time.h, e.target.value)}
                  className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none">
                  {Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {showTime && selectedDate && (
                  <button type="button" onClick={() => setOpen(false)}
                    className="ml-2 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors">
                    Done
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Go to today */}
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-center">
            <button type="button" onClick={() => {
              const t = todayStr;
              if (showTime) { onChange(`${t}T${time.h}:${time.m}`); }
              else { onChange(t); setOpen(false); }
              setCalMonth({ m: new Date().getMonth(), y: new Date().getFullYear() });
            }} className="text-xs font-medium text-brand-500 hover:underline">Go to today</button>
          </div>
        </div>
      )}
    </div>
  );
}
