"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dateKeyFromDate, gregorianToJalaliParts, weekKeyFromDateKey } from "./dates";
import { createInitialState, dayHasActivity, mergeDayRecord } from "./defaults";
import { loadPlannerState, savePlannerState } from "./storage";
import type {
  DayFood,
  DayExpense,
  DayPhoto,
  DayRecord,
  DaySchedule,
  DayTask,
  ExpenseCategory,
  NavView,
  PlannerSettings,
  PlannerState,
  WeeklyGoal,
} from "./types";

type PlannerContextValue = {
  loaded: boolean;
  navView: NavView;
  setNavView: (v: NavView) => void;
  selectedDateKey: string;
  setSelectedDateKey: (key: string) => void;
  todayKey: string;
  state: PlannerState;
  selectedDay: DayRecord;
  updateSettings: (patch: Partial<PlannerSettings>) => void;
  updateDay: (dateKey: string, updater: (day: DayRecord) => DayRecord) => void;
  setGratitude: (index: number, value: string) => void;
  setSchedule: (patch: Partial<DaySchedule>) => void;
  addPhoto: (dataUrl: string) => void;
  removePhoto: (id: string) => void;
  addExpense: (input: Omit<DayExpense, "id">) => void;
  updateExpense: (id: string, input: Omit<DayExpense, "id">) => void;
  removeExpense: (id: string) => void;
  addFood: (input: Omit<DayFood, "id">) => void;
  updateFood: (id: string, input: Omit<DayFood, "id">) => void;
  removeFood: (id: string) => void;
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;
  removeTask: (id: string) => void;
  addGoal: (title: string, target: number) => void;
  updateGoalProgress: (id: string, progress: number) => void;
  removeGoal: (id: string) => void;
  dateHasActivity: (dateKey: string) => boolean;
  stats: {
    todayExpenses: number;
    todayCalories: number;
    todayPendingTasks: number;
    weekGoalsDone: number;
    weekGoalsTotal: number;
    monthExpensesForSelectedDayMonth: number;
  };
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

const noopSubscribe = () => () => {};

function useClientTodayKey(): { loaded: boolean; todayKey: string } {
  const loaded = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const todayKey = useSyncExternalStore(
    noopSubscribe,
    () => dateKeyFromDate(new Date()),
    () => ""
  );
  return { loaded, todayKey };
}

export function PlannerProvider({ children }: { children: ReactNode }) {
  const { loaded, todayKey } = useClientTodayKey();
  const [state, setState] = useState<PlannerState>(createInitialState);
  const [navView, setNavView] = useState<NavView>("dashboard");
  const [selectedDateKey, setSelectedDateKey] = useState("");

  const activeDateKey = selectedDateKey || todayKey;

  useEffect(() => {
    if (!loaded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted data after client mount
    setState(loadPlannerState());
    setSelectedDateKey((prev) => prev || todayKey);
  }, [loaded, todayKey]);

  useEffect(() => {
    if (!loaded) return;
    savePlannerState(state);
  }, [state, loaded]);

  const selectedDay = useMemo(
    () => mergeDayRecord(state.days[activeDateKey]),
    [state.days, activeDateKey]
  );

  const currentWeekKey = useMemo(
    () => (todayKey ? weekKeyFromDateKey(todayKey) : ""),
    [todayKey]
  );

  const weekGoals = useMemo(
    () => state.goals.filter((g) => g.weekKey === currentWeekKey),
    [state.goals, currentWeekKey]
  );

  const stats = useMemo(() => {
    const today = todayKey ? mergeDayRecord(state.days[todayKey]) : mergeDayRecord();
    const todayExpenses = today.expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const todayCalories = today.foods.reduce((s, f) => s + (Number(f.calories) || 0), 0);
    const todayPendingTasks = today.tasks.filter((t) => !t.completed).length;
    const weekGoalsTotal = weekGoals.length;
    const weekGoalsDone = weekGoals.filter((g) => g.progress >= g.target).length;

    let monthExpensesForSelectedDayMonth = 0;
    if (activeDateKey) {
      const parts = gregorianToJalaliParts(new Date(activeDateKey + "T12:00:00"));
      for (const [key, partial] of Object.entries(state.days)) {
        const p = gregorianToJalaliParts(new Date(key + "T12:00:00"));
        if (p.jy === parts.jy && p.jm === parts.jm) {
          const day = mergeDayRecord(partial);
          monthExpensesForSelectedDayMonth += day.expenses.reduce(
            (s, e) => s + (Number(e.amount) || 0),
            0
          );
        }
      }
    }

    return {
      todayExpenses,
      todayCalories,
      todayPendingTasks,
      weekGoalsDone,
      weekGoalsTotal,
      monthExpensesForSelectedDayMonth,
    };
  }, [state.days, todayKey, weekGoals, activeDateKey]);

  const updateDay = useCallback(
    (dateKey: string, updater: (day: DayRecord) => DayRecord) => {
      setState((prev) => {
        const current = mergeDayRecord(prev.days[dateKey]);
        const next = updater(current);
        return {
          ...prev,
          days: { ...prev.days, [dateKey]: next },
        };
      });
    },
    []
  );

  const updateSettings = useCallback((patch: Partial<PlannerSettings>) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
  }, []);

  const setGratitude = useCallback(
    (index: number, value: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => {
        const next = [...day.gratitude] as [string, string, string];
        next[index] = value;
        return { ...day, gratitude: next };
      });
    },
    [activeDateKey, updateDay]
  );

  const setSchedule = useCallback(
    (patch: Partial<DaySchedule>) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        schedule: { ...day.schedule, ...patch },
      }));
    },
    [activeDateKey, updateDay]
  );

  const addPhoto = useCallback(
    (dataUrl: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        photos: [...day.photos, { id: crypto.randomUUID(), dataUrl }],
      }));
    },
    [activeDateKey, updateDay]
  );

  const removePhoto = useCallback(
    (id: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        photos: day.photos.filter((p) => p.id !== id),
      }));
    },
    [activeDateKey, updateDay]
  );

  const addExpense = useCallback(
    (input: Omit<DayExpense, "id">) => {
      if (!activeDateKey) return;
      const amount = Number(input.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        expenses: [
          ...day.expenses,
          {
            id: crypto.randomUUID(),
            amount,
            category: input.category,
            description: input.description.trim(),
          },
        ],
      }));
    },
    [activeDateKey, updateDay]
  );

  const updateExpense = useCallback(
    (id: string, input: Omit<DayExpense, "id">) => {
      if (!activeDateKey) return;
      const amount = Number(input.amount);
      if (!Number.isFinite(amount) || amount <= 0) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        expenses: day.expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                amount,
                category: input.category,
                description: input.description.trim(),
              }
            : e
        ),
      }));
    },
    [activeDateKey, updateDay]
  );

  const removeExpense = useCallback(
    (id: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        expenses: day.expenses.filter((e) => e.id !== id),
      }));
    },
    [activeDateKey, updateDay]
  );

  const addFood = useCallback(
    (input: Omit<DayFood, "id">) => {
      if (!activeDateKey) return;
      const calories = Number(input.calories);
      if (!input.name.trim() || !Number.isFinite(calories) || calories < 0) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        foods: [
          ...day.foods,
          {
            id: crypto.randomUUID(),
            name: input.name.trim(),
            quantity: input.quantity.trim(),
            calories,
          },
        ],
      }));
    },
    [activeDateKey, updateDay]
  );

  const updateFood = useCallback(
    (id: string, input: Omit<DayFood, "id">) => {
      if (!activeDateKey) return;
      const calories = Number(input.calories);
      if (!input.name.trim() || !Number.isFinite(calories) || calories < 0) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        foods: day.foods.map((f) =>
          f.id === id
            ? {
                ...f,
                name: input.name.trim(),
                quantity: input.quantity.trim(),
                calories,
              }
            : f
        ),
      }));
    },
    [activeDateKey, updateDay]
  );

  const removeFood = useCallback(
    (id: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        foods: day.foods.filter((f) => f.id !== id),
      }));
    },
    [activeDateKey, updateDay]
  );

  const addTask = useCallback(
    (text: string) => {
      if (!activeDateKey) return;
      const value = text.trim();
      if (!value) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        tasks: [...day.tasks, { id: crypto.randomUUID(), text: value, completed: false }],
      }));
    },
    [activeDateKey, updateDay]
  );

  const toggleTask = useCallback(
    (id: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        tasks: day.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      }));
    },
    [activeDateKey, updateDay]
  );

  const updateTask = useCallback(
    (id: string, text: string) => {
      if (!activeDateKey) return;
      const value = text.trim();
      if (!value) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        tasks: day.tasks.map((t) => (t.id === id ? { ...t, text: value } : t)),
      }));
    },
    [activeDateKey, updateDay]
  );

  const removeTask = useCallback(
    (id: string) => {
      if (!activeDateKey) return;
      updateDay(activeDateKey, (day) => ({
        ...day,
        tasks: day.tasks.filter((t) => t.id !== id),
      }));
    },
    [activeDateKey, updateDay]
  );

  const addGoal = useCallback(
    (title: string, target: number) => {
      const t = title.trim();
      const tgt = Math.max(1, Math.floor(target));
      if (!t || !currentWeekKey) return;
      const goal: WeeklyGoal = {
        id: crypto.randomUUID(),
        title: t,
        target: tgt,
        progress: 0,
        weekKey: currentWeekKey,
      };
      setState((prev) => ({ ...prev, goals: [goal, ...prev.goals] }));
    },
    [currentWeekKey]
  );

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === id ? { ...g, progress: Math.max(0, Math.min(g.target, Math.floor(progress))) } : g
      ),
    }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }, []);

  const dateHasActivity = useCallback(
    (dateKey: string) => dayHasActivity(mergeDayRecord(state.days[dateKey])),
    [state.days]
  );

  const value: PlannerContextValue = {
    loaded,
    navView,
    setNavView,
    selectedDateKey: activeDateKey,
    setSelectedDateKey,
    todayKey,
    state,
    selectedDay,
    updateSettings,
    updateDay,
    setGratitude,
    setSchedule,
    addPhoto,
    removePhoto,
    addExpense,
    updateExpense,
    removeExpense,
    addFood,
    updateFood,
    removeFood,
    addTask,
    toggleTask,
    updateTask,
    removeTask,
    addGoal,
    updateGoalProgress,
    removeGoal,
    dateHasActivity,
    stats,
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner must be used within PlannerProvider");
  return ctx;
}

export type { ExpenseCategory, DayTask, DayExpense, DayFood, DayPhoto };