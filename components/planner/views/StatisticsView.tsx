"use client";

import { MonthlyChart } from "@/components/planner/MonthlyChart";

export function StatisticsView() {
  return (
    <div className="view-stack">
      <MonthlyChart />
    </div>
  );
}