import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  HijriDate,
  gregorianToFatimi,
  fatimiToGregorian,
  buildCalendarMonth,
  weekdayHeaders,
  nextMonth,
  prevMonth,
  isSameHijriDay,
  MONTH_NAMES_LONG,
  MONTH_NAMES_SHORT,
} from "../core/index";
import { Tuple } from "../core/hijri";
import { gregorianShortMonthNames } from "../core/calendar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  /** Currently selected date (controlled) */
  value?: Date | null;
  /** Called when user picks a date — receives the Gregorian Date */
  onChange?: (date: Date, hijri: HijriDate) => void;
  /** Placeholder shown in the input when nothing is selected */
  placeholder?: string;
  /** 0 = Saturday (default, Bohra standard), 1 = Sunday, 2 = Monday */
  weekStartsOn?: 0 | 1 | 2;
  /** "long" = "Shehre Moharramul Haram", "short" = "Moharram" */
  monthNameStyle?: "long" | "short";
  /** Show the corresponding Gregorian date below each Hijri day number */
  showGregorianDate?: boolean;
  /** Custom month names for the long style */
  longMonthNames?: Tuple<string, 12>;
  /** Custom month names for the short style */
  shortMonthNames?: Tuple<string, 12>;
  /** Disable specific dates */
  isDateDisabled?: (date: Date, hijri: HijriDate) => boolean;
  /** Additional class on the root wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePicker({
  value,
  onChange,
  placeholder = "Select Hijri date",
  weekStartsOn = 0,
  monthNameStyle = "long",
  showGregorianDate = false,
  isDateDisabled,
  className = "",
  longMonthNames = MONTH_NAMES_LONG,
  shortMonthNames = MONTH_NAMES_SHORT,
}: DatePickerProps) {
  // 1. Create local "let" variables so we can overwrite them if they are wrong
  let finalLongNames = longMonthNames;
  let finalShortNames = shortMonthNames;
  let finalStyle = monthNameStyle;
  let finalWeekStart = weekStartsOn;

  // 2. Validation Guard: Long Month Names
  if (longMonthNames !== MONTH_NAMES_LONG && longMonthNames.length !== 12) {
    console.warn("bohra-datepicker: longMonthNames must have exactly 12 elements. Falling back to defaults.");
    finalLongNames = MONTH_NAMES_LONG;
  }

  // 3. Validation Guard: Short Month Names
  if (shortMonthNames !== MONTH_NAMES_SHORT && shortMonthNames.length !== 12) {
    console.warn("bohra-datepicker: shortMonthNames must have exactly 12 elements. Falling back to defaults.");
    finalShortNames = MONTH_NAMES_SHORT;
  }

  // 4. Validation Guard: Week Starts On
  if (weekStartsOn < 0 || weekStartsOn > 2) {
    console.warn("bohra-datepicker: weekStartsOn must be 0 (Sat), 1 (Sun), or 2 (Mon). Falling back to 0.");
    finalWeekStart = 0;
  }

  // 5. Validation Guard: Month Name Style
  if (monthNameStyle !== "long" && monthNameStyle !== "short") {
    console.warn("bohra-datepicker: monthNameStyle must be 'long' or 'short'. Falling back to 'long'.");
    finalStyle = "long";
  }

  const today = gregorianToFatimi(new Date());

  const initialHijri = value ? gregorianToFatimi(value) : today;
  const [viewYear, setViewYear] = useState(initialHijri.year);
  const [viewMonth, setViewMonth] = useState(initialHijri.month);
  const [selected, setSelected] = useState<HijriDate | null>(
    value ? gregorianToFatimi(value) : null
  );
  const [open, setOpen] = useState(false);
  const [yearInput, setYearInput] = useState(String(initialHijri.year));

  const rootRef = useRef<HTMLDivElement>(null);

  // Sync controlled value
  useEffect(() => {
    if (value) {
      const h = gregorianToFatimi(value);
      setSelected(h);
      setViewYear(h.year);
      setViewMonth(h.month);
      setYearInput(String(h.year));
    } else {
      setSelected(null);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const calendar = buildCalendarMonth(viewYear, viewMonth, finalWeekStart);
  const headers = weekdayHeaders(finalWeekStart);
  const names = finalStyle === "long" ? finalLongNames : finalShortNames;

  const handlePrev = () => {
    const p = prevMonth(viewYear, viewMonth);
    setViewYear(p.year);
    setViewMonth(p.month);
    setYearInput(String(p.year));
  };
  const handleNext = () => {
    const n = nextMonth(viewYear, viewMonth);
    setViewYear(n.year);
    setViewMonth(n.month);
    setYearInput(String(n.year));
  };
  const handleMonthSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setViewMonth(Number(e.target.value));
  };
  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYearInput(e.target.value);
    const y = parseInt(e.target.value, 10);
    if (!isNaN(y) && y > 0) setViewYear(y);
  };
  const handleDayClick = useCallback(
    (hijri: HijriDate, gregorian: Date) => {
      if (isDateDisabled?.(gregorian, hijri)) return;
      setSelected(hijri);
      setOpen(false);
      onChange?.(gregorian, hijri);
    },
    [onChange, isDateDisabled]
  );

  const displayValue = selected
    ? `${selected.day} ${names[selected.month - 1]} ${selected.year} AH`
    : "";

  return (
    <div
      ref={rootRef}
      className={`bdp-root${className ? ` ${className}` : ""}`}
      data-open={open}
    >
      {/* ── Trigger input ── */}
      <div className="bdp-input-wrap" onClick={() => setOpen((o) => !o)}>
        <input
          className="bdp-input"
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
        />
        <span className="bdp-chevron" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div className="bdp-dropdown" role="dialog" aria-label="Hijri date picker">
          {/* Header */}
          <div className="bdp-header">
            <button className="bdp-nav-btn" onClick={handlePrev} aria-label="Previous month">
              ‹
            </button>

            <div className="bdp-header-center">
              <select
                className="bdp-month-select"
                value={viewMonth}
                onChange={handleMonthSelect}
                aria-label="Select month"
              >
                {finalLongNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>
                    {finalStyle === "long" ? name : finalShortNames[idx]}
                  </option>
                ))}
              </select>

              <input
                className="bdp-year-input"
                type="number"
                value={yearInput}
                onChange={handleYearInput}
                aria-label="Hijri year"
                min={1}
                max={2000}
              />
              <span className="bdp-year-suffix">AH</span>
            </div>

            <button className="bdp-nav-btn" onClick={handleNext} aria-label="Next month">
              ›
            </button>
          </div>

          {/* Weekday headers */}
          <div className="bdp-grid bdp-weekdays" role="row">
            {headers.map((h) => (
              <div key={h} className="bdp-weekday" role="columnheader">
                {h}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="bdp-weeks">
            {calendar.weeks.map((week, wi) => (
              <div key={wi} className="bdp-grid bdp-week" role="row">
                {week.map((cell, di) => {
                  const isSelected = selected
                    ? isSameHijriDay(cell.hijri, selected)
                    : false;
                  const disabled = isDateDisabled?.(cell.gregorian, cell.hijri) ?? false;

                  return (
                    <button
                      key={di}
                      className={[
                        "bdp-day",
                        cell.isCurrentMonth ? "" : "bdp-day--other",
                        cell.isToday ? "bdp-day--today" : "",
                        isSelected ? "bdp-day--selected" : "",
                        disabled ? "bdp-day--disabled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleDayClick(cell.hijri, cell.gregorian)}
                      disabled={disabled}
                      aria-label={`${cell.hijri.day} ${finalShortNames[cell.hijri.month - 1]} ${cell.hijri.year}`}
                      aria-pressed={isSelected}
                      role="gridcell"
                      tabIndex={cell.isCurrentMonth ? 0 : -1}
                    >
                      <span className="bdp-day-hijri">{cell.hijri.day}</span>
                      {showGregorianDate && (
                        <span className="bdp-day-greg">
                          {cell.gregorian.getDate() + " " + gregorianShortMonthNames[cell.gregorian.getMonth()]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer: today shortcut */}
          <div className="bdp-footer">
            <button
              className="bdp-today-btn"
              onClick={() => {
                setViewYear(today.year);
                setViewMonth(today.month);
                setYearInput(String(today.year));
                const greg = fatimiToGregorian(today);
                handleDayClick(today, greg);
              }}
            >
              Today: {today.day} {finalShortNames[today.month - 1]} {today.year}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
