"use client";

import { formatJalaliDayMonth, parseDateKey } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";
import { ExpensesSection } from "@/components/planner/sections/ExpensesSection";
import { FoodSection } from "@/components/planner/sections/FoodSection";
import { GratitudeSection } from "@/components/planner/sections/GratitudeSection";
import { PhotoSection } from "@/components/planner/sections/PhotoSection";
import { ScheduleSection } from "@/components/planner/sections/ScheduleSection";
import { TasksSection } from "@/components/planner/sections/TasksSection";

export function PlannerView() {
  const { selectedDateKey } = usePlanner();
  const label = selectedDateKey
    ? formatJalaliDayMonth(parseDateKey(selectedDateKey))
    : "امروز";

  return (
    <div className="view-stack">
      <p className="date-banner">برنامه روز {label}</p>
      <GratitudeSection />
      <PhotoSection />
      <ScheduleSection />
      <ExpensesSection />
      <FoodSection />
      <TasksSection />
    </div>
  );
}