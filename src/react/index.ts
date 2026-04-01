export { DatePicker } from "./DatePicker";
export type { DatePickerProps } from "./DatePicker";
export { injectStyles, STYLES } from "./styles";

// Re-export core utilities so React users don't need a second import
export {
  gregorianToFatimi,
  fatimiToGregorian,
  formatHijri,
  todayFatimi,
  isKabisa,
  daysInHijriMonth,
  MONTH_NAMES_LONG,
  MONTH_NAMES_SHORT,
} from "../core/index";

export type { HijriDate } from "../core/index";
