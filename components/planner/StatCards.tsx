"use client";

import { toPersianDigits } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";

function formatToman(n: number) {
  return `${toPersianDigits(Math.round(n).toLocaleString("en-US"))} تومان`;
}

export function StatCards() {
  const { stats } = usePlanner();
  const goalRatio =
    stats.weekGoalsTotal === 0 ? 0 : stats.weekGoalsDone / stats.weekGoalsTotal;

  return (
    <div className="stats-grid" aria-label="آمار امروز">
      <article className="stat-card">
        <p className="stat-label">هزینه‌های امروز</p>
        <p className="stat-value">{formatToman(stats.todayExpenses)}</p>
      </article>
      <article className="stat-card">
        <p className="stat-label">کالری دریافتی</p>
        <p className="stat-value">{toPersianDigits(stats.todayCalories)} kcal</p>
      </article>
      <article className="stat-card">
        <p className="stat-label">وظایف باقی‌مانده</p>
        <p className="stat-value">{toPersianDigits(stats.todayPendingTasks)}</p>
      </article>
      <article className="stat-card stat-card-goals">
        <p className="stat-label">اهداف هفتگی</p>
        <p className="stat-value">
          {toPersianDigits(stats.weekGoalsDone)} / {toPersianDigits(stats.weekGoalsTotal)}
        </p>
        <div className="progress-track" aria-hidden>
          <div className="progress-fill" style={{ width: `${goalRatio * 100}%` }} />
        </div>
      </article>
    </div>
  );
}