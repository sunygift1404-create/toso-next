import type { DayRecord, DaySchedule, PlannerState } from "./types";

export const STORAGE_KEY = "rozno-planner-v1";
export const LEGACY_TASKS_KEY = "todo-tasks";
export const LEGACY_USER_KEY = "rozno-user-name";

export const emptySchedule = (): DaySchedule => ({
  wakeTime: "",
  bedTime: "",
  workStart: "",
  workEnd: "",
});

export const emptyDayRecord = (): DayRecord => ({
  gratitude: ["", "", ""],
  photos: [],
  schedule: emptySchedule(),
  expenses: [],
  foods: [],
  tasks: [],
});

export function mergeDayRecord(partial?: Partial<DayRecord>): DayRecord {
  const base = emptyDayRecord();
  if (!partial) return base;
  return {
    gratitude: partial.gratitude
      ? ([...(partial.gratitude as string[]), "", "", ""].slice(0, 3) as [
          string,
          string,
          string,
        ])
      : base.gratitude,
    photos: partial.photos ? [...partial.photos] : base.photos,
    schedule: { ...base.schedule, ...partial.schedule },
    expenses: partial.expenses ? [...partial.expenses] : base.expenses,
    foods: partial.foods ? [...partial.foods] : base.foods,
    tasks: partial.tasks ? [...partial.tasks] : base.tasks,
  };
}

export function createInitialState(): PlannerState {
  return {
    version: 1,
    settings: { userName: "" },
    days: {},
    goals: [],
  };
}

export function dayHasActivity(record: DayRecord): boolean {
  if (record.gratitude.some((g) => g.trim())) return true;
  if (record.photos.length > 0) return true;
  if (record.expenses.length > 0) return true;
  if (record.foods.length > 0) return true;
  if (record.tasks.length > 0) return true;
  const s = record.schedule;
  return Boolean(s.wakeTime || s.bedTime || s.workStart || s.workEnd);
}