"use client";

import { buildDayActivityLines, getDayRecordFromState } from "@/lib/planner/day-summary";
import { formatJalaliDayMonth, parseDateKey } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";

type Props = {
  dateKey: string;
};

export function DayActivityList({ dateKey }: Props) {
  const { state, setNavView } = usePlanner();
  if (!dateKey) return null;
  const record = getDayRecordFromState(state, dateKey);
  const lines = buildDayActivityLines(record);

  return (
    <div className="day-activity">
      <div className="day-activity-head">
        <h3>فعالیت‌های {formatJalaliDayMonth(parseDateKey(dateKey))}</h3>
        <button type="button" className="ghost-btn" onClick={() => setNavView("planner")}>
          ویرایش برنامه
        </button>
      </div>
      {lines.length === 0 ? (
        <p className="empty-note">برای این روز داده‌ای ثبت نشده.</p>
      ) : (
        <ul className="activity-list">
          {lines.map((line) => (
            <li key={line.id}>{line.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}