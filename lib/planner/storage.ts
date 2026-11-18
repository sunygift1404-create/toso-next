import { dateKeyFromDate } from "./dates";
import { createInitialState, LEGACY_TASKS_KEY, LEGACY_USER_KEY, mergeDayRecord, STORAGE_KEY } from "./defaults";
import type { DayRecord, PlannerState } from "./types";

function migrateLegacyTasks(state: PlannerState): PlannerState {
  if (typeof window === "undefined") return state;
  try {
    const raw = localStorage.getItem(LEGACY_TASKS_KEY);
    if (!raw) return state;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return state;
    const days = { ...state.days };
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const text = typeof row.text === "string" ? row.text : "";
      if (!text.trim()) continue;
      const createdAt = typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString();
      let key = dateKeyFromDate(new Date(createdAt));
      if (Number.isNaN(new Date(createdAt).getTime())) {
        key = dateKeyFromDate(new Date());
      }
      const record = days[key] ?? {};
      const tasks = record.tasks ? [...record.tasks] : [];
      tasks.push({
        id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
        text,
        completed: Boolean(row.completed),
      });
      days[key] = { ...record, tasks };
    }
    return { ...state, days };
  } catch {
    return state;
  }
}

function migrateLegacyUser(state: PlannerState): PlannerState {
  if (typeof window === "undefined") return state;
  if (state.settings.userName) return state;
  const name = localStorage.getItem(LEGACY_USER_KEY);
  if (!name) return state;
  return { ...state, settings: { ...state.settings, userName: name } };
}

export function loadPlannerState(): PlannerState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      let state = createInitialState();
      state = migrateLegacyUser(state);
      state = migrateLegacyTasks(state);
      return state;
    }
    const parsed = JSON.parse(raw) as PlannerState;
    if (!parsed || parsed.version !== 1) return createInitialState();
    return {
      version: 1,
      settings: parsed.settings ?? { userName: "" },
      days: parsed.days ?? {},
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
    };
  } catch {
    return createInitialState();
  }
}

export function savePlannerState(state: PlannerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function getDayRecord(state: PlannerState, dateKey: string): DayRecord {
  return mergeDayRecord(state.days[dateKey]);
}