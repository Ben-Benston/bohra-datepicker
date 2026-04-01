# bohra-datepicker

A Hijri date picker for the **Dawoodi Bohra Fatimi calendar** — works with React and plain HTML/CSS/JS.

The Dawoodi Bohra community uses a Fatimi Hijri calendar that differs by 1 day from the standard Islamic calendar on certain years. This package uses exact 30-year lookup tables (not the floating-point Kuwait Algorithm) to get those dates right.

<a href="https://www.npmjs.com/package/bohra-datepicker"><img src="https://badge.fury.io/js/bohra-datepicker.svg"></a>
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/Ben-Benston/bohra-datepicker/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6)](https://www.typescriptlang.org)

## Install

```bash
npm install bohra-datepicker
```

---

## Usage

### React

```jsx
import { useState } from "react";
import {
    DatePicker,
    injectStyles,
    gregorianToFatimi,
    fatimiToGregorian,
    formatHijri,
} from "bohra-datepicker/react";

// Inject CSS once at the root of your app
injectStyles();

function MyForm() {
    // 1. Setup State
    const [date, setDate] = useState(new Date()); // Defaults to Today
    const [hijri, setHijri] = useState(gregorianToFatimi(new Date()));

    // 2. Setting values programmatically
    const setSpecificDate = () => {
        // To set a date using Hijri numbers:
        const newGregorian = fatimiToGregorian({
            day: 1,
            month: 9,
            year: 1447,
        });
        setDate(newGregorian);
        setHijri({ day: 1, month: 9, year: 1447 });
    };

    return (
        <div className="p-4">
            <DatePicker
                value={date}
                onChange={(gregDate, hijriDate) => {
                    // Update both state variables
                    setDate(gregDate);
                    setHijri(hijriDate);
                }}
            />

            <button onClick={setSpecificDate}>Set to 1 Ramadaan</button>

            {/* 3. Using Utility Functions */}
            <div className="mt-4">
                <p>
                    Selected Hijri: {hijri.day}/{hijri.month}/{hijri.year}
                </p>
                <p>Formatted: {formatHijri(hijri, "long")}</p>
            </div>
        </div>
    );
}
```

#### React Props

| Prop                | Type                                        | Default                           | Description                                    |
| ------------------- | ------------------------------------------- | --------------------------------- | ---------------------------------------------- |
| `value`             | `Date \| null`                              | —                                 | Controlled selected date (Gregorian)           |
| `onChange`          | `(date: Date, hijri: HijriDate) => void`    | —                                 | Called on date selection                       |
| `placeholder`       | `string`                                    | `"Select Hijri date"`             | Input placeholder                              |
| `weekStartsOn`      | `0 \| 1 \| 2`                               | `0`                               | 0=Sun, 1=Mon, 2=Sat                            |
| `monthNameStyle`    | `"long" \| "short"`                         | `"long"`                          | Month name format                              |
| `showGregorianDate` | `boolean`                                   | `false`                           | Show Gregorian day number in each cell         |
| `isDateDisabled`    | `(date: Date, hijri: HijriDate) => boolean` | —                                 | Disable specific dates                         |
| `className`         | `string`                                    | `""`                              | Extra class on root element                    |
| `longMonthNames`    | `string[12]`                                | [MONTH_NAMES_LONG](#month-names)  | Array of 12 strings for full form month names  |
| `shortMonthNames`   | `string[12]`                                | [MONTH_NAMES_SHORT](#month-names) | Array of 12 strings for short form month names |

---

### Vanilla HTML / JS

Drop the IIFE bundle in a `<script>` tag — no build step needed.

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="https://unpkg.com/bohra-datepicker/dist/vanilla/bohra-datepicker.global.js"></script>
    </head>
    <body>
        <input id="my-date-input" type="text" placeholder="Pick a date..." />

        <script>
            const picker = new BohraDatepicker.Picker("#my-date-input", {
                onChange: function (gregorianDate, hijriDate) {
                    console.log("Gregorian:", gregorianDate);
                    console.log("Hijri:", hijriDate);
                    // hijriDate = { day: 14, month: 10, year: 1447 }
                },
                placeholder: "Select Hijri date",
                monthNameStyle: "long", // "long" | "short"
                showGregorianDate: false,
                weekStartsOn: 0, // 0=Sun, 1=Mon, 2=Sat
            });

            // Programmatic API
            picker.setValue(new Date()); // set a date
            picker.getValue(); // returns Date | null
            picker.getHijriValue(); // returns HijriDate | null
            picker.destroy(); // cleanup
        </script>
    </body>
</html>
```

---

### Core utilities only (no UI)

If you just need the date conversion logic:

```js
import {
    gregorianToFatimi,
    fatimiToGregorian,
    formatHijri,
    todayFatimi,
    isKabisa,
    daysInHijriMonth,
} from "bohra-datepicker";

// Convert Gregorian → Fatimi Hijri
const hijri = gregorianToFatimi(new Date(2005, 1, 9)); // Input → 9th February 2005
// → { day: 1, month: 1, year: 1426 }

// Format it
formatHijri(hijri, "long"); // "1 Shehre Moharramul Haram 1426 AH"
formatHijri(hijri, "short"); // "1 Moharram 1426 AH"

// Convert back
const greg = fatimiToGregorian({ day: 1, month: 1, year: 1426 });
// → Date: Feb 9, 2005

// Today's Hijri date
const today = todayFatimi();

// Is a year a Kabisa (leap) year?
isKabisa(1426); // → true

// Days in a specific month
daysInHijriMonth(1426, 12); // → 30 (Zilhaj in a Kabisa year)
```

---

## Theming

The component uses CSS custom properties. Override them to match your brand:

```css
.bdp-root {
    --bdp-accent: #8b1a1a !important; /* your brand colour */
    --bdp-accent-light: #fdf0f0 !important;
    --bdp-radius: 4px !important; /* sharper corners */
    --bdp-day-size: 38px !important; /* larger cells */
}
```

---

## Custom Month Names

You can override the default month names (e.g., for different transliterations or languages).
**Note:** You must provide an array of exactly 12 strings. See [Default Month Names](#month-names) for reference.

### React

```jsx
const customLong = ["Moharram", "Safar", ...]; // must have 12 items

<DatePicker
  longMonthNames={customLong}
  monthNameStyle="long"
/>
```

### Vanilla

```js
const picker = new BohraDatepicker.Picker("#input", {
  longMonthNames: ["Moharram", "Safar", ...], // 12 items
  shortMonthNames: ["Moh", "Saf", ...],      // 12 items
});
```

---

## Month Names

| #   | Long                     | Short         |
| --- | ------------------------ | ------------- |
| 1   | Shehre Moharramul Haram  | Moharram      |
| 2   | Safarul Muzaffar         | Safar         |
| 3   | Rabiul Awwal             | Rabiul Awwal  |
| 4   | Rabiul Akhar             | Rabiul Akhar  |
| 5   | Jamadal Ula              | Jamadal Ula   |
| 6   | Jamadal Ukhra            | Jamadal Ukhra |
| 7   | Shehre Rajabul Asab      | Rajab         |
| 8   | Shabanul Karim           | Shabaan       |
| 9   | Shehre Ramazanul Moazzam | Ramadaan      |
| 10  | Shawwalul Mukarram       | Shawwal       |
| 11  | Zilqadatil Haram         | Zilqadah      |
| 12  | Zilhijjatil Haram        | Zilhaj        |

---

## Why not the Kuwait Algorithm?

The [Kuwait Algorithm](https://www.al-habib.info/islamic-calendar/hijricalendartext.htm) uses a floating-point average of `10631/30 ≈ 354.366` days per year. On Kabisa (leap) years that actually have 355 days, this average drifts and places the month boundary 1 day too late.

This package uses **exact 30-year lookup tables** (the same epoch as the Fatimi Hijri calendar: AJD 1948083.5 = 1 Moharram 1 AH), which correctly handles every Kabisa year boundary.

Verified against the official Fatimi Dawat calendar.

---

## License

MIT — see [LICENSE](https://github.com/Ben-Benston/pdfcast/blob/main/LICENSE) for details.
© Burhanuddin Nasikwala
