/**
 * Default styles for BohraDatepicker React component.
 * Import this in your app: import "bohra-datepicker/react/styles.css"
 * Or copy and override the CSS variables for your own theme.
 */
export const STYLES = `
/* ─── Reset & Root ──────────────────────────────────────────── */
.bdp-root {
  --bdp-font: system-ui, -apple-system, sans-serif;

  /* Brand colours — override these for custom themes */
  --bdp-accent:        #1a6b4a;
  --bdp-accent-light:  #e8f5ef;
  --bdp-accent-hover:  #155a3d;
  --bdp-today-ring:    #1a6b4a;
  --bdp-text:          #1a1a1a;
  --bdp-text-muted:    #888;
  --bdp-bg:            #ffffff;
  --bdp-border:        #ddd;
  --bdp-shadow:        0 8px 24px rgba(0,0,0,0.12);
  --bdp-radius:        10px;
  --bdp-radius-sm:     6px;
  --bdp-day-size:      36px;

  position: relative;
  display: inline-block;
  font-family: var(--bdp-font);
}

/* ─── Input ─────────────────────────────────────────────────── */
.bdp-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--bdp-border);
  border-radius: var(--bdp-radius-sm);
  padding: 8px 12px;
  cursor: pointer;
  background: var(--bdp-bg);
  gap: 8px;
  transition: border-color 0.15s;
  min-width: 240px;
}
.bdp-root[data-open="true"] .bdp-input-wrap {
  border-color: var(--bdp-accent);
  box-shadow: 0 0 0 3px var(--bdp-accent-light);
}
.bdp-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--bdp-text);
  background: transparent;
  cursor: pointer;
  font-family: var(--bdp-font);
}
.bdp-input::placeholder { color: var(--bdp-text-muted); }
.bdp-chevron { color: var(--bdp-text-muted); font-size: 10px; }

/* ─── Dropdown ──────────────────────────────────────────────── */
.bdp-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  background: var(--bdp-bg);
  border: 1.5px solid var(--bdp-border);
  border-radius: var(--bdp-radius);
  box-shadow: var(--bdp-shadow);
  padding: 12px;
  min-width: 300px;
  animation: bdp-pop 0.15s ease;
}
@keyframes bdp-pop {
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

/* ─── Header ────────────────────────────────────────────────── */
.bdp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 6px;
}
.bdp-header-center {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
}
.bdp-nav-btn {
  background: none;
  border: 1.5px solid var(--bdp-border);
  border-radius: var(--bdp-radius-sm);
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
  color: var(--bdp-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.1s, border-color 0.1s;
}
.bdp-nav-btn:hover { background: var(--bdp-accent-light); border-color: var(--bdp-accent); }
.bdp-month-select {
  font-size: 13px;
  font-weight: 600;
  color: var(--bdp-text);
  border: 1.5px solid var(--bdp-border);
  border-radius: var(--bdp-radius-sm);
  padding: 4px 6px;
  background: var(--bdp-bg);
  cursor: pointer;
  font-family: var(--bdp-font);
}
.bdp-year-input {
  width: 58px;
  font-size: 13px;
  font-weight: 600;
  color: var(--bdp-text);
  border: 1.5px solid var(--bdp-border);
  border-radius: var(--bdp-radius-sm);
  padding: 4px 6px;
  text-align: center;
  font-family: var(--bdp-font);
  -moz-appearance: textfield;
}
.bdp-year-input::-webkit-outer-spin-button,
.bdp-year-input::-webkit-inner-spin-button { -webkit-appearance: none; }
.bdp-year-suffix { font-size: 12px; color: var(--bdp-text-muted); font-weight: 500; }

/* ─── Grid ──────────────────────────────────────────────────── */
.bdp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.bdp-weekdays { margin-bottom: 4px; }
.bdp-weekday {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--bdp-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 0;
}
.bdp-weeks { display: flex; flex-direction: column; gap: 2px; }

/* ─── Day cells ─────────────────────────────────────────────── */
.bdp-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: var(--bdp-day-size);
  border-radius: var(--bdp-radius-sm);
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--bdp-font);
  transition: background 0.1s, color 0.1s;
  gap: 1px;
}
.bdp-day:hover:not(:disabled) { background: var(--bdp-accent-light); }
.bdp-day-hijri {
  font-size: 13px;
  font-weight: 500;
  color: var(--bdp-text);
  line-height: 1;
}
.bdp-day-greg {
  font-size: 9px;
  color: var(--bdp-text-muted);
  line-height: 1;
}

/* States */
.bdp-day--other .bdp-day-hijri  { color: var(--bdp-text-muted); }
.bdp-day--today                 { outline: 2px solid var(--bdp-today-ring); outline-offset: -2px; }
.bdp-day--selected              { background: var(--bdp-accent) !important; }
.bdp-day--selected .bdp-day-hijri,
.bdp-day--selected .bdp-day-greg { color: #fff; }
.bdp-day--disabled              { opacity: 0.35; cursor: not-allowed; }

/* ─── Footer ────────────────────────────────────────────────── */
.bdp-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--bdp-border);
  text-align: center;
}
.bdp-today-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: var(--bdp-accent);
  cursor: pointer;
  font-weight: 600;
  font-family: var(--bdp-font);
  padding: 4px 8px;
  border-radius: var(--bdp-radius-sm);
  transition: background 0.1s;
}
.bdp-today-btn:hover { background: var(--bdp-accent-light); }
`;

/** Inject the default styles into the document <head>. Call once at app startup. */
export function injectStyles(): void {
  if (typeof document === "undefined") return;
  const id = "bdp-styles";
  if (document.getElementById(id)) return; // already injected
  const style = document.createElement("style");
  style.id = id;
  style.textContent = STYLES;
  document.head.appendChild(style);
}
