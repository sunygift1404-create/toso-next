import { mergeDayRecord } from "./defaults";
import type { DayRecord, PlannerState } from "./types";
import { EXPENSE_CATEGORY_LABELS } from "./types";
import { toPersianDigits } from "./dates";
import { computeSleepMinutes, computeWorkMinutes, minutesToDurationLabel } from "./time";

export type DayActivityLine = {
  id: string;
  text: string;
};

export function buildDayActivityLines(record: DayRecord): DayActivityLine[] {
  const lines: DayActivityLine[] = [];
  record.tasks.forEach((t) => {
    lines.push({
      id: `task-${t.id}`,
      text: `${t.completed ? "✓" : "○"} ${t.text}`,
    });
  });
  record.expenses.forEach((e) => {
    lines.push({
      id: `exp-${e.id}`,
      text: `هزینه ${EXPENSE_CATEGORY_LABELS[e.category]}: ${toPersianDigits(Math.round(e.amount).toLocaleString("en-US"))} تومان`,
    });
  });
  record.foods.forEach((f) => {
    lines.push({
      id: `food-${f.id}`,
      text: `غذا: ${f.name} (${toPersianDigits(f.calories)} kcal)`,
    });
  });
  record.gratitude.forEach((g, i) => {
    if (g.trim()) lines.push({ id: `gratitude-${i}`, text: `سپاس: ${g.trim()}` });
  });
  const s = record.schedule;
  const work = computeWorkMinutes(s.workStart, s.workEnd);
  const sleep = computeSleepMinutes(s.wakeTime, s.bedTime);
  if (work && work > 0) {
    lines.push({ id: "work", text: `کار: ${minutesToDurationLabel(work)}` });
  }
  if (sleep && sleep > 0) {
    lines.push({ id: "sleep", text: `خواب: ${minutesToDurationLabel(sleep)}` });
  }
  if (record.photos.length > 0) {
    lines.push({
      id: "photos",
      text: `عکس: ${toPersianDigits(record.photos.length)} مورد`,
    });
  }
  return lines;
}

export function getDayRecordFromState(state: PlannerState, dateKey: string): DayRecord {
  return mergeDayRecord(state.days[dateKey]);
}