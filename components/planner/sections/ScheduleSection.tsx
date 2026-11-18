"use client";

import { usePlanner } from "@/lib/planner/context";
import {
  computeSleepMinutes,
  computeWorkMinutes,
  minutesToDurationLabel,
} from "@/lib/planner/time";

export function ScheduleSection() {
  const { selectedDay, setSchedule } = usePlanner();
  const s = selectedDay.schedule;
  const sleepM = computeSleepMinutes(s.wakeTime, s.bedTime);
  const workM = computeWorkMinutes(s.workStart, s.workEnd);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>خواب و کار</h2>
      </div>
      <div className="two-col">
        <div className="sub-panel">
          <h3>خواب</h3>
          <div className="inline-fields">
            <label className="field">
              <span>بیدار شدن</span>
              <input
                type="time"
                value={s.wakeTime}
                onChange={(e) => setSchedule({ wakeTime: e.target.value })}
              />
            </label>
            <label className="field">
              <span>خوابیدن</span>
              <input
                type="time"
                value={s.bedTime}
                onChange={(e) => setSchedule({ bedTime: e.target.value })}
              />
            </label>
          </div>
          <p className="calc-line">
            مدت خواب: {sleepM !== null && sleepM > 0 ? minutesToDurationLabel(sleepM) : "—"}
          </p>
        </div>
        <div className="sub-panel">
          <h3>ساعات کاری</h3>
          <div className="inline-fields">
            <label className="field">
              <span>شروع کار</span>
              <input
                type="time"
                value={s.workStart}
                onChange={(e) => setSchedule({ workStart: e.target.value })}
              />
            </label>
            <label className="field">
              <span>پایان کار</span>
              <input
                type="time"
                value={s.workEnd}
                onChange={(e) => setSchedule({ workEnd: e.target.value })}
              />
            </label>
          </div>
          <p className="calc-line">
            مجموع کار: {workM !== null && workM > 0 ? minutesToDurationLabel(workM) : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}