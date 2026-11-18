import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function formatJalaliLong(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      calendar: "persian",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("fa-IR").format(date);
  }
}

export function formatJalaliShort(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      calendar: "persian",
      year: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return formatJalaliLong(date);
  }
}

export function formatJalaliDayMonth(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function gregorianToJalaliParts(date: Date): { jy: number; jm: number; jd: number } {
  return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function jalaliToDateKey(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function dateKeysInJalaliMonth(jy: number, jm: number): string[] {
  const len = jalaaliMonthLength(jy, jm);
  const keys: string[] = [];
  for (let jd = 1; jd <= len; jd++) {
    keys.push(jalaliToDateKey(jy, jm, jd));
  }
  return keys;
}

export function jalaliMonthLabel(jy: number, jm: number): string {
  const midKey = jalaliToDateKey(jy, jm, 15);
  return formatJalaliShort(parseDateKey(midKey));
}

export function weekKeyFromDateKey(dateKey: string): string {
  const d = parseDateKey(dateKey);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return dateKeyFromDate(d);
}

export function motivationalLine(seed: number): string {
  const lines = [
    "امروز را با آرامش و تمرکز آغاز کن.",
    "قدم‌های کوچک، تغییرهای بزرگ می‌سازند.",
    "به پیشرفت خودت افتخار کن، نه کمال.",
    "هر روز فرصتی تازه برای رشد است.",
    "مهربانی با خودت، اولین اولویت است.",
  ];
  return lines[seed % lines.length];
}