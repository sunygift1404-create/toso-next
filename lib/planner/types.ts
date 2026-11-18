export type NavView = "dashboard" | "planner" | "goals" | "statistics" | "settings";

export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "education"
  | "other";

export type ChartMetric = "workHours" | "sleepDuration" | "wakeTime" | "bedTime";

export type DayTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type DayExpense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
};

export type DayFood = {
  id: string;
  name: string;
  quantity: string;
  calories: number;
};

export type DayPhoto = {
  id: string;
  dataUrl: string;
};

export type DaySchedule = {
  wakeTime: string;
  bedTime: string;
  workStart: string;
  workEnd: string;
};

export type DayRecord = {
  gratitude: [string, string, string];
  photos: DayPhoto[];
  schedule: DaySchedule;
  expenses: DayExpense[];
  foods: DayFood[];
  tasks: DayTask[];
};

export type WeeklyGoal = {
  id: string;
  title: string;
  target: number;
  progress: number;
  weekKey: string;
};

export type PlannerSettings = {
  userName: string;
};

export type PlannerState = {
  version: 1;
  settings: PlannerSettings;
  days: Record<string, Partial<DayRecord>>;
  goals: WeeklyGoal[];
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "غذا",
  transport: "حمل‌ونقل",
  shopping: "خرید",
  entertainment: "تفریح",
  education: "آموزش",
  other: "سایر",
};

export const CHART_METRIC_LABELS: Record<ChartMetric, string> = {
  workHours: "ساعات کاری",
  sleepDuration: "مدت خواب",
  wakeTime: "زمان بیدار شدن",
  bedTime: "زمان خواب",
};

export const NAV_LABELS: Record<NavView, string> = {
  dashboard: "داشبورد",
  planner: "برنامه روزانه",
  goals: "اهداف",
  statistics: "آمار",
  settings: "تنظیمات",
};