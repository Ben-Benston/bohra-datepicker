/**
 * Calendar grid helpers
 * Generates the data needed to render a Hijri month grid.
 */
import {
  HijriDate,
  gregorianToFatimi,
  fatimiToGregorian,
  daysInHijriMonth,
  MONTH_NAMES_LONG,
  MONTH_NAMES_SHORT,
} from "./hijri";

export { MONTH_NAMES_LONG, MONTH_NAMES_SHORT };
export type { HijriDate };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarDay {
  /** The Hijri date for this cell */
  hijri: HijriDate;
  /** The corresponding Gregorian date */
  gregorian: Date;
  /** True if this day belongs to the displayed month (vs overflow padding) */
  isCurrentMonth: boolean;
  /** True if this is today */
  isToday: boolean;
}

export interface CalendarMonth {
  /** The Hijri year being displayed */
  year: number;
  /** The Hijri month being displayed (1–12) */
  month: number;
  /** 6 rows × 7 columns = 42 cells (padded with prev/next month days) */
  weeks: CalendarDay[][];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate to the next Hijri month */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/** Navigate to the previous Hijri month */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/** Compare two HijriDates — returns negative, 0, or positive */
export function compareHijri(a: HijriDate, b: HijriDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/** Check if two HijriDates are the same day */
export function isSameHijriDay(a: HijriDate, b: HijriDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

// ─── Grid builder ─────────────────────────────────────────────────────────────

/**
 * Build the full calendar grid for a given Hijri month.
 * Always returns 6 weeks (42 cells) so the layout never jumps.
 * Week starts on Saturday (day 0) — standard in the Bohra calendar.
 *
 * @param year  Hijri year
 * @param month Hijri month (1–12)
 * @param weekStartsOn 0=Saturday, 1=Sunday, 2=Monday (default: 0)
 */
export function buildCalendarMonth(
  year: number,
  month: number,
  weekStartsOn: 0 | 1 | 2 = 0
): CalendarMonth {
  const today = gregorianToFatimi(new Date());
  const totalDays = daysInHijriMonth(year, month);

  // What Gregorian date does 1st of this Hijri month fall on?
  const firstGregorian = fatimiToGregorian({ day: 1, month, year });

  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // We need to find what column (0–6) the 1st falls in, given our week start
  const WEEK_START_OFFSETS: Record<0 | 1 | 2, number> = {
    0: 6, // Saturday-start: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
    1: 0, // Sunday-start:   Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    2: 1, // Monday-start:   Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  };
  const offset = WEEK_START_OFFSETS[weekStartsOn];
  const firstDayOfWeek = (firstGregorian.getDay() + offset) % 7;

  // Build a flat array of all cells
  const cells: CalendarDay[] = [];

  // Padding from previous month
  const prev = prevMonth(year, month);
  const prevMonthDays = daysInHijriMonth(prev.year, prev.month);
  for (let p = firstDayOfWeek - 1; p >= 0; p--) {
    const d = prevMonthDays - p;
    const hijri: HijriDate = { day: d, month: prev.month, year: prev.year };
    cells.push({
      hijri,
      gregorian: fatimiToGregorian(hijri),
      isCurrentMonth: false,
      isToday: isSameHijriDay(hijri, today),
    });
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const hijri: HijriDate = { day: d, month, year };
    cells.push({
      hijri,
      gregorian: fatimiToGregorian(hijri),
      isCurrentMonth: true,
      isToday: isSameHijriDay(hijri, today),
    });
  }

  // Padding from next month — fill to exactly 42 cells (6 rows)
  const next = nextMonth(year, month);
  let nextDay = 1;
  while (cells.length < 42) {
    const hijri: HijriDate = { day: nextDay, month: next.month, year: next.year };
    cells.push({
      hijri,
      gregorian: fatimiToGregorian(hijri),
      isCurrentMonth: false,
      isToday: isSameHijriDay(hijri, today),
    });
    nextDay++;
  }

  // Split into 6 rows of 7
  const weeks: CalendarDay[][] = [];
  for (let row = 0; row < 6; row++) {
    weeks.push(cells.slice(row * 7, row * 7 + 7));
  }

  return { year, month, weeks };
}

/**
 * Returns the column headers for the calendar grid.
 * @param weekStartsOn 0=Saturday, 1=Sunday, 2=Monday
 */
export function weekdayHeaders(weekStartsOn: 0 | 1 | 2 = 0): string[] {
  const SUN_START = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MON_START = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const SAT_START = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  return weekStartsOn === 0 ? SUN_START : weekStartsOn === 1 ? MON_START : SAT_START;
}

export const gregorianShortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];