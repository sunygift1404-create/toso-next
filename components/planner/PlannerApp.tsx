"use client";

import { useEffect, useMemo, useState } from "react";
import "@/app/planner.css";
import {
  IconCalendar,
  IconChart,
  IconClose,
  IconGrid,
  IconMenu,
  IconSettings,
  IconTarget,
} from "@/components/planner/icons";
import { DashboardView } from "@/components/planner/views/DashboardView";
import { GoalsView } from "@/components/planner/views/GoalsView";
import { PlannerView } from "@/components/planner/views/PlannerView";
import { SettingsView } from "@/components/planner/views/SettingsView";
import { StatisticsView } from "@/components/planner/views/StatisticsView";
import { formatJalaliLong, motivationalLine, parseDateKey } from "@/lib/planner/dates";
import { PlannerProvider, usePlanner } from "@/lib/planner/context";
import { NAV_LABELS, type NavView } from "@/lib/planner/types";

const navItems: { id: NavView; icon: React.ReactNode }[] = [
  { id: "dashboard", icon: <IconGrid /> },
  { id: "planner", icon: <IconCalendar /> },
  { id: "goals", icon: <IconTarget /> },
  { id: "statistics", icon: <IconChart /> },
  { id: "settings", icon: <IconSettings /> },
];

function PlannerShell() {
  const { loaded, navView, setNavView, state, todayKey } = usePlanner();
  const [mobileOpen, setMobileOpen] = useState(false);
  const jalaliToday = useMemo(
    () => (todayKey ? formatJalaliLong(parseDateKey(todayKey)) : ""),
    [todayKey]
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  if (!loaded) {
    return (
      <div className="planner-root loading" dir="rtl" lang="fa">
        <div className="loading-card">
          <div className="loader" />
          <p>در حال بارگذاری…</p>
        </div>
      </div>
    );
  }

  const name = state.settings.userName.trim();
  const welcome = name ? `${name} عزیز، خوش آمدی` : "به برنامه‌ریز روزانه خوش آمدی";
  const quote = todayKey ? motivationalLine(parseDateKey(todayKey).getDate()) : "";

  function renderView() {
    switch (navView) {
      case "dashboard":
        return <DashboardView />;
      case "planner":
        return <PlannerView />;
      case "goals":
        return <GoalsView />;
      case "statistics":
        return <StatisticsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  }

  return (
    <div className="planner-root" dir="rtl" lang="fa">
      <div
        className={`sidebar-backdrop${mobileOpen ? " open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">ر</span>
          <div>
            <p className="brand-title">روزنو</p>
            <p className="brand-sub">داشبورد برنامه‌ریزی شخصی</p>
          </div>
          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="بستن منو"
          >
            <IconClose />
          </button>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item${navView === item.id ? " active" : ""}`}
              onClick={() => {
                setNavView(item.id);
                setMobileOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {NAV_LABELS[item.id]}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-shell">
        <header className="top-header">
          <button
            type="button"
            className="icon-btn mobile-only"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
          >
            <IconMenu />
          </button>
          <div className="header-text">
            <p className="welcome">{welcome}</p>
            <h1>{NAV_LABELS[navView]}</h1>
            {jalaliToday && <p className="jalali-date">{jalaliToday}</p>}
            {quote && <p className="quote-line">{quote}</p>}
          </div>
        </header>
        <main className="content">{renderView()}</main>
      </div>
    </div>
  );
}

export default function PlannerApp() {
  return (
    <PlannerProvider>
      <PlannerShell />
    </PlannerProvider>
  );
}