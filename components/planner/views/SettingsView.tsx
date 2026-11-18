"use client";

import { useState } from "react";
import { dateKeyFromDate } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";
import { createInitialState, STORAGE_KEY } from "@/lib/planner/defaults";
import { savePlannerState } from "@/lib/planner/storage";

export function SettingsView() {
  const { state, updateSettings } = usePlanner();
  const [name, setName] = useState(state.settings.userName);

  function saveName(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({ userName: name.trim() });
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rozno-backup-${dateKeyFromDate(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { version?: number };
        if (parsed?.version !== 1) {
          window.alert("فایل پشتیبان معتبر نیست.");
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.location.reload();
      } catch {
        window.alert("خواندن فایل ناموفق بود.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function clearAll() {
    if (!window.confirm("همه داده‌های ذخیره‌شده پاک شود؟")) return;
    const fresh = createInitialState();
    savePlannerState(fresh);
    window.location.reload();
  }

  return (
    <section className="panel settings-panel">
      <h2>تنظیمات</h2>
      <p className="muted">نام شما در پیام خوش‌آمد استفاده می‌شود. داده‌ها در مرورگر شما ذخیره می‌شوند.</p>
      <form className="stack settings-form" onSubmit={saveName}>
        <label className="field">
          <span>نام</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً آرزو"
            maxLength={40}
          />
        </label>
        <button type="submit" className="primary-btn">
          ذخیره
        </button>
      </form>
      <div className="settings-actions stack">
        <button type="button" className="primary-btn" onClick={exportBackup}>
          دانلود پشتیبان JSON
        </button>
        <label className="file-import">
          <span className="ghost-btn">بازیابی از فایل پشتیبان</span>
          <input type="file" accept="application/json" className="sr-only" onChange={importBackup} />
        </label>
      </div>
      <div className="danger-zone">
        <button type="button" className="ghost-btn danger" onClick={clearAll}>
          پاک‌کردن همه داده‌ها
        </button>
      </div>
    </section>
  );
}