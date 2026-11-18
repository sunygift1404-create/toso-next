"use client";

import { useState } from "react";
import { toPersianDigits, weekKeyFromDateKey } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";

export function GoalsView() {
  const { state, todayKey, addGoal, updateGoalProgress, removeGoal } = usePlanner();
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("1");
  const weekKey = todayKey ? weekKeyFromDateKey(todayKey) : "";
  const goals = state.goals.filter((g) => g.weekKey === weekKey);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addGoal(title, Number(target) || 1);
    setTitle("");
    setTarget("1");
  }

  return (
    <div className="view-stack">
      <section className="panel">
        <div className="panel-head">
          <h2>اهداف این هفته</h2>
        </div>
        <form className="inline-form" onSubmit={submit}>
          <input
            required
            placeholder="عنوان هدف"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <input
            type="number"
            min={1}
            max={100}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-label="هدف هفتگی"
          />
          <button type="submit" className="primary-btn">
            افزودن هدف
          </button>
        </form>
        {goals.length === 0 ? (
          <p className="empty-note">هنوز هدفی برای این هفته ثبت نشده.</p>
        ) : (
          <ul className="goal-list">
            {goals.map((g) => {
              const ratio = g.target === 0 ? 0 : g.progress / g.target;
              return (
                <li key={g.id} className="goal-item">
                  <div className="goal-head">
                    <strong>{g.title}</strong>
                    <span>
                      {toPersianDigits(g.progress)} / {toPersianDigits(g.target)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${ratio * 100}%` }} />
                  </div>
                  <div className="goal-actions">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => updateGoalProgress(g.id, g.progress + 1)}
                      disabled={g.progress >= g.target}
                    >
                      +۱ پیشرفت
                    </button>
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => updateGoalProgress(g.id, g.target)}
                    >
                      تکمیل
                    </button>
                    <button type="button" className="ghost-btn danger" onClick={() => removeGoal(g.id)}>
                      حذف
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}