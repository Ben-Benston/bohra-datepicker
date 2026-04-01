/**
 * BohraDatepicker — vanilla JS widget
 * No framework required. Works with a plain <script> tag.
 *
 * Usage:
 *   const picker = new BohraDatepicker.Picker("#my-input", { onChange: (date, hijri) => {} });
 *   picker.destroy(); // cleanup
 */

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
  todayFatimi,
  formatHijri
} from "../core/index";

import type { Tuple } from "../core/hijri";
import { gregorianShortMonthNames } from "../core/calendar";

export type { HijriDate };
export {
  gregorianToFatimi,
  fatimiToGregorian,
  todayFatimi,
  MONTH_NAMES_LONG,
  MONTH_NAMES_SHORT,
  formatHijri,
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerOptions {
  onChange?: (date: Date, hijri: HijriDate) => void;
  placeholder?: string;
  weekStartsOn?: 0 | 1 | 2;
  monthNameStyle?: "long" | "short";
  showGregorianDate?: boolean;
  isDateDisabled?: (date: Date, hijri: HijriDate) => boolean;
  longMonthNames?: Tuple<string, 12>;
  shortMonthNames?: Tuple<string, 12>;
  /** Inject default CSS automatically (default: true) */
  injectStyles?: boolean;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
.bdp-root{--bdp-accent:#1a6b4a;--bdp-accent-light:#e8f5ef;--bdp-accent-hover:#155a3d;--bdp-today-ring:#1a6b4a;--bdp-text:#1a1a1a;--bdp-text-muted:#888;--bdp-bg:#fff;--bdp-border:#ddd;--bdp-shadow:0 8px 24px rgba(0,0,0,.12);--bdp-radius:10px;--bdp-radius-sm:6px;--bdp-day-size:36px;position:relative;display:inline-block;font-family:system-ui,-apple-system,sans-serif}
.bdp-input-wrap{display:flex;align-items:center;border:1.5px solid var(--bdp-border);border-radius:var(--bdp-radius-sm);padding:8px 12px;cursor:pointer;background:var(--bdp-bg);gap:8px;transition:border-color .15s;min-width:240px}
.bdp-root[data-open=true] .bdp-input-wrap{border-color:var(--bdp-accent);box-shadow:0 0 0 3px var(--bdp-accent-light)}
.bdp-input{flex:1;border:none;outline:none;font-size:14px;color:var(--bdp-text);background:transparent;cursor:pointer}
.bdp-input::placeholder{color:var(--bdp-text-muted)}
.bdp-chevron{color:var(--bdp-text-muted);font-size:10px}
.bdp-dropdown{position:absolute;top:calc(100% + 6px);left:0;z-index:1000;background:var(--bdp-bg);border:1.5px solid var(--bdp-border);border-radius:var(--bdp-radius);box-shadow:var(--bdp-shadow);padding:12px;min-width:300px;animation:bdp-pop .15s ease}
@keyframes bdp-pop{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.bdp-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:6px}
.bdp-header-center{display:flex;align-items:center;gap:6px;flex:1;justify-content:center}
.bdp-nav-btn{background:none;border:1.5px solid var(--bdp-border);border-radius:var(--bdp-radius-sm);width:30px;height:30px;font-size:18px;cursor:pointer;color:var(--bdp-text);display:flex;align-items:center;justify-content:center;transition:background .1s,border-color .1s}
.bdp-nav-btn:hover{background:var(--bdp-accent-light);border-color:var(--bdp-accent)}
.bdp-month-select,.bdp-year-input{font-size:13px;font-weight:600;color:var(--bdp-text);border:1.5px solid var(--bdp-border);border-radius:var(--bdp-radius-sm);padding:4px 6px;background:var(--bdp-bg);cursor:pointer}
.bdp-year-input{width:58px;text-align:center;-moz-appearance:textfield}
.bdp-year-input::-webkit-outer-spin-button,.bdp-year-input::-webkit-inner-spin-button{-webkit-appearance:none}
.bdp-year-suffix{font-size:12px;color:var(--bdp-text-muted);font-weight:500}
.bdp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.bdp-weekdays{margin-bottom:4px}
.bdp-weekday{text-align:center;font-size:11px;font-weight:700;color:var(--bdp-text-muted);text-transform:uppercase;letter-spacing:.04em;padding:4px 0}
.bdp-weeks{display:flex;flex-direction:column;gap:2px}
.bdp-day{display:flex;flex-direction:column;align-items:center;justify-content:center;height:var(--bdp-day-size);border-radius:var(--bdp-radius-sm);border:none;background:none;cursor:pointer;transition:background .1s,color .1s;gap:1px;width:100%}
.bdp-day:hover:not(:disabled){background:var(--bdp-accent-light)}
.bdp-day-hijri{font-size:13px;font-weight:500;color:var(--bdp-text);line-height:1}
.bdp-day-greg{font-size:9px;color:var(--bdp-text-muted);line-height:1}
.bdp-day--other .bdp-day-hijri{color:var(--bdp-text-muted)}
.bdp-day--today{outline:2px solid var(--bdp-today-ring);outline-offset:-2px}
.bdp-day--selected{background:var(--bdp-accent)!important}
.bdp-day--selected .bdp-day-hijri,.bdp-day--selected .bdp-day-greg{color:#fff}
.bdp-day--disabled{opacity:.35;cursor:not-allowed}
.bdp-footer{margin-top:10px;padding-top:8px;border-top:1px solid var(--bdp-border);text-align:center}
.bdp-today-btn{background:none;border:none;font-size:12px;color:var(--bdp-accent);cursor:pointer;font-weight:600;padding:4px 8px;border-radius:var(--bdp-radius-sm);transition:background .1s}
.bdp-today-btn:hover{background:var(--bdp-accent-light)}
`;

function injectCSS(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("bdp-styles")) return;
  const el = document.createElement("style");
  el.id = "bdp-styles";
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ─── Picker class ─────────────────────────────────────────────────────────────

export class Picker {
  private root: HTMLElement;
  private opts: Required<PickerOptions>;
  private viewYear: number;
  private viewMonth: number;
  private selected: HijriDate | null = null;
  private dropdown: HTMLElement | null = null;
  private _outsideClick: (e: MouseEvent) => void;

  constructor(target: string | HTMLElement, options: PickerOptions = {}) {
    const el = typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
    if (!el) throw new Error(`BohraDatepicker: target "${target}" not found`);

    this.opts = {
      onChange: options.onChange ?? (() => { }),
      placeholder: options.placeholder ?? "Select Hijri date",
      weekStartsOn: options.weekStartsOn ?? 0,
      monthNameStyle: options.monthNameStyle ?? "long",
      showGregorianDate: options.showGregorianDate ?? false,
      isDateDisabled: options.isDateDisabled ?? (() => false),
      longMonthNames: options.longMonthNames ?? MONTH_NAMES_LONG,
      shortMonthNames: options.shortMonthNames ?? MONTH_NAMES_SHORT,
      injectStyles: options.injectStyles ?? true,
    };

    // Validation Guard
    if (options.longMonthNames && options.longMonthNames.length !== 12) {
      console.warn("bohra-datepicker: longMonthNames must have exactly 12 elements. Falling back to defaults.");
      this.opts.longMonthNames = MONTH_NAMES_LONG;
    }

    if (options.shortMonthNames && options.shortMonthNames.length !== 12) {
      console.warn("bohra-datepicker: shortMonthNames must have exactly 12 elements. Falling back to defaults.");
      this.opts.shortMonthNames = MONTH_NAMES_SHORT;
    }

    if (this.opts.weekStartsOn < 0 || this.opts.weekStartsOn > 2) {
      console.warn("bohra-datepicker: weekStartsOn must be 0 (Sat), 1 (Sun), or 2 (Mon). Falling back to 0.");
      this.opts.weekStartsOn = 0;
    }

    if (this.opts.monthNameStyle !== "long" && this.opts.monthNameStyle !== "short") {
      console.warn("bohra-datepicker: monthNameStyle must be 'long' or 'short'. Falling back to 'long'.");
      this.opts.monthNameStyle = "long";
    }

    if (this.opts.injectStyles) injectCSS();

    const today = todayFatimi();
    this.viewYear = today.year;
    this.viewMonth = today.month;

    this.root = document.createElement("div");
    this.root.className = "bdp-root";
    el.replaceWith(this.root);

    this._render();

    this._outsideClick = (e: MouseEvent) => {
      if (this.dropdown && !this.root.contains(e.target as Node)) {
        this._closeDropdown();
      }
    };
    document.addEventListener("mousedown", this._outsideClick);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Set the selected date programmatically */
  setValue(date: Date | null): void {
    if (date) {
      const h = gregorianToFatimi(date);
      this.selected = h;
      this.viewYear = h.year;
      this.viewMonth = h.month;
    } else {
      this.selected = null;
    }
    this._render();
  }

  /** Get the currently selected Gregorian Date (or null) */
  getValue(): Date | null {
    return this.selected ? fatimiToGregorian(this.selected) : null;
  }

  /** Get the currently selected HijriDate (or null) */
  getHijriValue(): HijriDate | null {
    return this.selected;
  }

  /** Remove the widget and restore the original element */
  destroy(): void {
    document.removeEventListener("mousedown", this._outsideClick);
    this.root.remove();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _render(): void {
    const names = this.opts.monthNameStyle === "long" ? this.opts.longMonthNames : this.opts.shortMonthNames;
    const displayValue = this.selected
      ? `${this.selected.day} ${names[this.selected.month - 1]} ${this.selected.year} AH`
      : "";
    const isOpen = this.dropdown !== null;
    this.root.dataset.open = String(isOpen);

    this.root.innerHTML = `
      <div class="bdp-input-wrap">
        <input class="bdp-input" type="text" readonly
          value="${displayValue}"
          placeholder="${this.opts.placeholder}" />
        <span class="bdp-chevron">${isOpen ? "▲" : "▼"}</span>
      </div>
    `;

    this.root.querySelector(".bdp-input-wrap")!
      .addEventListener("click", () => this._toggleDropdown());

    if (isOpen) this._renderDropdown();
  }

  private _toggleDropdown(): void {
    if (this.dropdown) {
      this._closeDropdown();
    } else {
      this._openDropdown();
    }
  }

  private _openDropdown(): void {
    this.dropdown = document.createElement("div");
    this.dropdown.className = "bdp-dropdown";
    this.root.appendChild(this.dropdown);
    this.root.dataset.open = "true";
    this._renderDropdown();
  }

  private _closeDropdown(): void {
    this.dropdown?.remove();
    this.dropdown = null;
    this.root.dataset.open = "false";
    // Update chevron
    const chevron = this.root.querySelector(".bdp-chevron");
    if (chevron) chevron.textContent = "▼";
  }

  private _renderDropdown(): void {
    if (!this.dropdown) return;
    const cal = buildCalendarMonth(this.viewYear, this.viewMonth, this.opts.weekStartsOn);
    const headers = weekdayHeaders(this.opts.weekStartsOn);
    const today = todayFatimi();

    const monthOptions = this.opts.longMonthNames
      .map((name, i) => `<option value="${i + 1}"${i + 1 === this.viewMonth ? " selected" : ""}>${this.opts.monthNameStyle === "long" ? name : this.opts.shortMonthNames[i]}</option>`)
      .join("");

    const weekdayHtml = headers
      .map(h => `<div class="bdp-weekday">${h}</div>`)
      .join("");

    const weeksHtml = cal.weeks.map(week => {
      const daysHtml = week.map(cell => {
        const isSel = this.selected ? isSameHijriDay(cell.hijri, this.selected) : false;
        const isDisabled = this.opts.isDateDisabled(cell.gregorian, cell.hijri);
        const classes = [
          "bdp-day",
          cell.isCurrentMonth ? "" : "bdp-day--other",
          cell.isToday ? "bdp-day--today" : "",
          isSel ? "bdp-day--selected" : "",
          isDisabled ? "bdp-day--disabled" : "",
        ].filter(Boolean).join(" ");
        const gregSpan = this.opts.showGregorianDate
          ? `<span class="bdp-day-greg">${`${cell.gregorian.getDate()} ${gregorianShortMonthNames[cell.gregorian.getMonth()]}`}</span>` : "";
        return `
          <button class="${classes}"
            data-day="${cell.hijri.day}"
            data-month="${cell.hijri.month}"
            data-year="${cell.hijri.year}"
            ${isDisabled ? "disabled" : ""}
            aria-label="${cell.hijri.day} ${this.opts.shortMonthNames[cell.hijri.month - 1]} ${cell.hijri.year}">
            <span class="bdp-day-hijri">${cell.hijri.day}</span>${gregSpan}
          </button>`;
      }).join("");
      return `<div class="bdp-grid bdp-week">${daysHtml}</div>`;
    }).join("");

    this.dropdown.innerHTML = `
      <div class="bdp-header">
        <button class="bdp-nav-btn bdp-prev">‹</button>
        <div class="bdp-header-center">
          <select class="bdp-month-select">${monthOptions}</select>
          <input class="bdp-year-input" type="number" value="${this.viewYear}" min="1" max="2000" />
          <span class="bdp-year-suffix">AH</span>
        </div>
        <button class="bdp-nav-btn bdp-next">›</button>
      </div>
      <div class="bdp-grid bdp-weekdays">${weekdayHtml}</div>
      <div class="bdp-weeks">${weeksHtml}</div>
      <div class="bdp-footer">
        <button class="bdp-today-btn">
          Today: ${today.day} ${this.opts.shortMonthNames[today.month - 1]} ${today.year}
        </button>
      </div>
    `;

    // Events
    this.dropdown.querySelector(".bdp-prev")!.addEventListener("click", () => {
      const p = prevMonth(this.viewYear, this.viewMonth);
      this.viewYear = p.year; this.viewMonth = p.month;
      this._renderDropdown();
    });
    this.dropdown.querySelector(".bdp-next")!.addEventListener("click", () => {
      const n = nextMonth(this.viewYear, this.viewMonth);
      this.viewYear = n.year; this.viewMonth = n.month;
      this._renderDropdown();
    });
    this.dropdown.querySelector(".bdp-month-select")!.addEventListener("change", (e) => {
      this.viewMonth = Number((e.target as HTMLSelectElement).value);
      this._renderDropdown();
    });
    this.dropdown.querySelector(".bdp-year-input")!.addEventListener("input", (e) => {
      const y = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(y) && y > 0) { this.viewYear = y; this._renderDropdown(); }
    });
    this.dropdown.querySelector(".bdp-today-btn")!.addEventListener("click", () => {
      const t = todayFatimi();
      this.viewYear = t.year; this.viewMonth = t.month;
      const greg = fatimiToGregorian(t);
      this._selectDay(t, greg);
    });
    this.dropdown.querySelectorAll(".bdp-day:not(:disabled)").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const el = e.currentTarget as HTMLElement;
        const hijri: HijriDate = {
          day: Number(el.dataset.day),
          month: Number(el.dataset.month),
          year: Number(el.dataset.year),
        };
        this._selectDay(hijri, fatimiToGregorian(hijri));
      });
    });
  }

  private _selectDay(hijri: HijriDate, greg: Date): void {
    this.selected = hijri;
    this.opts.onChange(greg, hijri);
    this._closeDropdown();
    this._render();
  }
}
