export function parseTimeToMinutes(value: string): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function minutesToDurationLabel(minutes: number): string {
  if (minutes <= 0 || !Number.isFinite(minutes)) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} دقیقه`;
  if (m === 0) return `${h} ساعت`;
  return `${h} ساعت و ${m} دقیقه`;
}

export function minutesToTimeLabel(minutes: number): string {
  if (!Number.isFinite(minutes)) return "—";
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function computeSleepMinutes(wake: string, bed: string): number | null {
  const wakeM = parseTimeToMinutes(wake);
  const bedM = parseTimeToMinutes(bed);
  if (wakeM === null || bedM === null) return null;
  let diff = wakeM - bedM;
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function computeWorkMinutes(start: string, end: string): number | null {
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  if (s === null || e === null) return null;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export function averageMinutes(values: number[]): number | null {
  const valid = values.filter((v) => v > 0);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}