import { todayInIndia } from "../../shared/date.js";

export function daysInCustody(value, today = new Date()) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const [todayYear, todayMonth, todayDay] = todayInIndia(today).split("-").map(Number);
  const currentDay = Date.UTC(todayYear, todayMonth - 1, todayDay);
  return Math.max(0, Math.floor((currentDay - start) / 86400000));
}

export function relativeDuration(days) {
  if (days == null) return "Not recorded";
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remaining = days - years * 365 - months * 30;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months || years) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (!years && !months) parts.push(`${remaining} ${remaining === 1 ? "day" : "days"}`);
  return parts.join(", ");
}
