"use client";

import { usePlanner } from "@/lib/planner/context";

export function GratitudeSection() {
  const { selectedDay, setGratitude } = usePlanner();
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>سپاس روزانه</h2>
      </div>
      <div className="stack">
        {selectedDay.gratitude.map((value, index) => (
          <label key={index} className="field">
            <span>مورد {index + 1}</span>
            <input
              type="text"
              value={value}
              onChange={(e) => setGratitude(index, e.target.value)}
              placeholder="چیز کوچکی که امروز قدردانش هستم…"
              maxLength={160}
            />
          </label>
        ))}
      </div>
    </section>
  );
}