"use client";

import { JalaliCalendar } from "@/components/planner/JalaliCalendar";
import { StatCards } from "@/components/planner/StatCards";
import {
  formatJalaliDayMonth,
  motivationalLine,
  parseDateKey,
  toPersianDigits,
} from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";
import { mergeDayRecord } from "@/lib/planner/defaults";

export function DashboardView() {
  const { selectedDateKey, state } = usePlanner();
  const day = selectedDateKey ? mergeDayRecord(state.days[selectedDateKey]) : mergeDayRecord();
  const pending = day.tasks.filter((t) => !t.completed).length;

  return (
    <div className="view-stack">
      <StatCards />
      <JalaliCalendar />
      {selectedDateKey && (
        <section className="panel day-preview">
          <h2>خلاصه {formatJalaliDayMonth(parseDateKey(selectedDateKey))}</h2>
          <ul className="preview-list">
            <li>وظایف باز: {toPersianDigits(pending)}</li>
            <li>هزینه‌ها: {toPersianDigits(day.expenses.length)} مورد</li>
            <li>غذا: {toPersianDigits(day.foods.length)} مورد</li>
            <li>
              سپاس: {toPersianDigits(day.gratitude.filter((g) => g.trim()).length)} از ۳
            </li>
          </ul>
          <p className="muted quote">{motivationalLine(parseDateKey(selectedDateKey).getDate())}</p>
        </section>
      )}
    </div>
  );
}