/**
 * Fatimi Hijri calendar conversion
 * Used by the Dawoodi Bohra community.
 *
 * Based on the AJD (Astronomical Julian Date) method with exact 30-year
 * lookup tables — fixes the 1-day drift in the Kuwait Algorithm on Kabisa years.
 * Also fixes the day=0 boundary bug present in mumineen_calendar_js.
 */

// Cumulative days at end of each month within a Hijri year (months 1–11).
// Month 12 (Zilhaj) length depends on whether it's a Kabisa year.
const DAYS_IN_YEAR = [30, 59, 89, 118, 148, 177, 207, 236, 266, 295, 325] as const;

// Cumulative days at end of each year within a 30-year Hijri cycle (years 1–30).
// Kabisa years have 355 days; regular years have 354.
const DAYS_IN_30_YEARS = [
  354, 708, 1063, 1417, 1771, 2126, 2480, 2834, 3189, 3543,
  3898, 4252, 4606, 4961, 5315, 5669, 6024, 6378, 6732, 7087,
  7441, 7796, 8150, 8504, 8859, 9213, 9567, 9922, 10276, 10631,
] as const;

// Which (year % 30) values are Kabisa (leap) years
const KABISA_REMAINDERS = new Set([2, 5, 8, 10, 13, 16, 19, 21, 24, 27, 29]);

export type Tuple<T, N extends number> = [T, ...T[]] & { length: N };

export const MONTH_NAMES_LONG: Tuple<string, 12> = [
  "Shehre Moharramul Haram",
  "Safarul Muzaffar",
  "Rabiul Awwal",
  "Rabiul Akhar",
  "Jamadal Ula",
  "Jamadal Ukhra",
  "Shehre Rajabul Asab",
  "Shabanul Karim",
  "Shehre Ramazanul Moazzam",
  "Shawwalul Mukarram",
  "Zilqadatil Haram",
  "Zilhijjatil Haram",
];

export const MONTH_NAMES_SHORT: Tuple<string, 12> = [
  "Moharram", "Safar", "Rabiul Awwal", "Rabiul Akhar",
  "Jamadal Ula", "Jamadal Ukhra", "Rajab", "Shabaan",
  "Ramadaan", "Shawwal", "Zilqadah", "Zilhaj",
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HijriDate {
  day: number;    // 1–30
  month: number;  // 1–12 (1 = Moharram, 12 = Zilhaj)
  year: number;   // e.g. 1447
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

/** Returns true if the given Hijri year is a Kabisa (leap) year */
export function isKabisa(year: number): boolean {
  return KABISA_REMAINDERS.has(year % 30);
}

/** Returns the number of days in a given Hijri month */
export function daysInHijriMonth(year: number, month: number): number {
  if (month === 12) return isKabisa(year) ? 30 : 29;
  // Odd months (1,3,5,7,9,11) = 30 days; even months = 29 days
  return month % 2 === 1 ? 30 : 29;
}

/**
 * Convert a Gregorian Date to Astronomical Julian Date (AJD).
 * AJD is a continuous day count; starts at noon hence the .5 offset.
 */
function gregorianToAJD(date: Date): number {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month < 3) { year--; month += 12; }

  // Julian calendar before Gregorian reform (Oct 15, 1582)
  const isJulian =
    date.getFullYear() < 1582 ||
    (date.getFullYear() === 1582 && date.getMonth() < 9) ||
    (date.getFullYear() === 1582 && date.getMonth() === 9 && date.getDate() < 15);

  let b = 0;
  if (!isJulian) {
    const a = Math.floor(year / 100);
    b = 2 - a + Math.floor(a / 4);
  }

  return (
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day + b - 1524.5
  );
}

/**
 * Convert an AJD value back to a Gregorian Date object.
 * Used for Hijri → Gregorian conversion.
 */
function ajdToGregorian(ajd: number): Date {
  const z = Math.floor(ajd + 0.5);
  const f = ajd + 0.5 - z;
  let a: number;
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(0.25 * alpha);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const dayF = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 2 : e - 14;
  const year = month < 2 ? c - 4715 : c - 4716;

  return new Date(year, month, Math.floor(dayF));
}

// ─── Main conversions ─────────────────────────────────────────────────────────

/**
 * Convert a Gregorian Date to the Dawoodi Bohra Fatimi Hijri calendar.
 *
 * @example
 * gregorianToFatimi(new Date(2005, 1, 9))
 * // → { day: 1, month: 1, year: 1426 }
 */
export function gregorianToFatimi(date: Date): HijriDate {
  const ajd = gregorianToAJD(date);

  // Days since epoch: 1 Moharram 1 AH = AJD 1948083.5
  let left = Math.floor(ajd - 1948083.5);

  // Strip complete 30-year cycles
  const y30 = Math.floor(left / 10631);
  left -= y30 * 10631;

  // Find year within current 30-year cycle
  let i = 0;
  while (left > DAYS_IN_30_YEARS[i]) i++;
  let year = y30 * 30 + i;

  if (i > 0) left -= DAYS_IN_30_YEARS[i - 1];

  // Boundary fix: left=0 means last day of the previous Hijri year
  if (left === 0) {
    year -= 1;
    return { day: isKabisa(year) ? 30 : 29, month: 12, year };
  }

  // Find month within current year
  let j = 0;
  while (left > DAYS_IN_YEAR[j]) j++;
  const month = j + 1;
  const day = j > 0
    ? Math.round(left - DAYS_IN_YEAR[j - 1])
    : Math.round(left);

  return { day, month, year };
}

/**
 * Convert a Fatimi Hijri date back to a Gregorian Date.
 *
 * @example
 * fatimiToGregorian({ day: 1, month: 1, year: 1426 })
 * // → Date object for Feb 9, 2005
 */
export function fatimiToGregorian(hijri: HijriDate): Date {
  const y30 = Math.floor(hijri.year / 30);
  const yRem = hijri.year - y30 * 30;

  // Days from epoch to start of this year
  let days = 1948083.5 + y30 * 10631;
  if (yRem > 0) days += DAYS_IN_30_YEARS[yRem - 1];

  // Add days within the year
  days += hijri.month === 1 ? hijri.day : DAYS_IN_YEAR[hijri.month - 2] + hijri.day;

  return ajdToGregorian(days);
}

/**
 * Format a HijriDate as a human-readable string.
 *
 * @example
 * formatHijri({ day: 1, month: 1, year: 1426 }, "long")
 * // → "1 Shehre Moharramul Haram 1426 AH"
 *
 * formatHijri({ day: 1, month: 1, year: 1426 }, "short")
 * // → "1 Moharram 1426 AH"
 */
export function formatHijri(
  hijri: HijriDate,
  style: "long" | "short" = "long"
): string {
  const names = style === "long" ? MONTH_NAMES_LONG : MONTH_NAMES_SHORT;
  return `${hijri.day} ${names[hijri.month - 1]} ${hijri.year} AH`;
}

/**
 * Returns today's Fatimi Hijri date.
 */
export function todayFatimi(): HijriDate {
  return gregorianToFatimi(new Date());
}
