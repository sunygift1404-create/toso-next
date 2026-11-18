"use client";

import { useEffect, useMemo, useState } from "react";
import { DayActivityList } from "@/components/planner/DayActivityList";
import { jalaaliMonthLength } from "jalaali-js";
import {
  gregorianToJalaliParts,
  jalaliMonthLabel,
  jalaliToDateKey,
  parseDateKey,
  toPersianDigits,
} from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function JalaliCalendar() {
  const { todayKey, selectedDateKey, setSelectedDateKey, dateHasActivity, setNavView } =
    usePlanner();
  const todayJ = useMemo(
    () => gregorianToJalaliParts(todayKey ? parseDateKey(todayKey) : new Date()),
    [todayKey]
  );
  const [viewJy, setViewJy] = useState(todayJ.jy);
  const [viewJm, setViewJm] = useState(todayJ.jm);

  useEffect(() => {
    if (!selectedDateKey) return;
    const p = gregorianToJalaliParts(parseDateKey(selectedDateKey));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep calendar month aligned with selection
    setViewJy(p.jy);
    setViewJm(p.jm);
  }, [selectedDateKey]);

  const grid = useMemo(() => {
    const len = jalaaliMonthLength(viewJy, viewJm);
    const firstKey = jalaliToDateKey(viewJy, viewJm, 1);
    const firstDate = parseDateKey(firstKey);
    const startCol = (firstDate.getDay() + 1) % 7;
    const cells: { key: string | null; jd: number | null }[] = [];
    for (let i = 0; i < startCol; i++) cells.push({ key: null, jd: null });
    for (let jd = 1; jd <= len; jd++) {
      cells.push({ key: jalaliToDateKey(viewJy, viewJm, jd), jd });
    }
    while (cells.length % 7 !== 0) cells.push({ key: null, jd: null });
    return cells;
  }, [viewJy, viewJm]);

  function prevMonth() {
    if (viewJm === 1) {
      setViewJy((y) => y - 1);
      setViewJm(12);
    } else setViewJm((m) => m - 1);
  }

  function nextMonth() {
    if (viewJm === 12) {
      setViewJy((y) => y + 1);
      setViewJm(1);
    } else setViewJm((m) => m + 1);
  }

  return (
    <section className="panel calendar-panel">
      <div className="panel-head">
        <h2>تقویم</h2>
        <div className="calendar-nav">
          <button type="button" className="ghost-btn" onClick={prevMonth} aria-label="ماه قبل">
            ‹
          </button>
          <span className="calendar-title">{jalaliMonthLabel(viewJy, viewJm)}</span>
          <button type="button" className="ghost-btn" onClick={nextMonth} aria-label="ماه بعد">
            ›
          </button>
          {todayKey && (
            <button
              type="button"
              className="ghost-btn today-jump"
              onClick={() => {
                setSelectedDateKey(todayKey);
                setNavView("planner");
              }}
            >
              امروز
            </button>
          )}
        </div>
      </div>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {grid.map((cell, i) => {
          if (!cell.key) return <span key={`e-${i}`} className="cal-cell empty" />;
          const isToday = cell.key === todayKey;
          const isSelected = cell.key === selectedDateKey;
          const hasData = dateHasActivity(cell.key);
          return (
            <button
              key={cell.key}
              type="button"
              className={`cal-cell${isToday ? " today" : ""}${isSelected ? " selected" : ""}`}
              onClick={() => setSelectedDateKey(cell.key!)}
            >
              <span>{toPersianDigits(cell.jd!)}</span>
              {hasData && <span className="cal-dot" aria-hidden />}
            </button>
          );
        })}
      </div>
      {selectedDateKey && <DayActivityList dateKey={selectedDateKey} />}
    </section>
  );
}