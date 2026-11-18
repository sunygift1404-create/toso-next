"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  dateKeysInJalaliMonth,
  gregorianToJalaliParts,
  jalaliMonthLabel,
  parseDateKey,
  toPersianDigits,
} from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";
import { mergeDayRecord } from "@/lib/planner/defaults";
import {
  averageMinutes,
  computeSleepMinutes,
  computeWorkMinutes,
  minutesToDurationLabel,
  minutesToTimeLabel,
  parseTimeToMinutes,
} from "@/lib/planner/time";
import { CHART_METRIC_LABELS, type ChartMetric } from "@/lib/planner/types";

type Point = {
  day: number;
  value: number | null;
  label: string;
};

export function MonthlyChart() {
  const { state, selectedDateKey, todayKey } = usePlanner();
  const base = selectedDateKey || todayKey;
  const baseJ = gregorianToJalaliParts(parseDateKey(base || new Date().toISOString().slice(0, 10)));
  const [jy, setJy] = useState(baseJ.jy);
  const [jm, setJm] = useState(baseJ.jm);
  const [metric, setMetric] = useState<ChartMetric>("workHours");

  const keys = useMemo(() => dateKeysInJalaliMonth(jy, jm), [jy, jm]);

  const series = useMemo(() => {
    const points: Point[] = keys.map((key, index) => {
      const day = index + 1;
      const record = mergeDayRecord(state.days[key]);
      const s = record.schedule;
      let value: number | null = null;
      let label = "—";
      if (metric === "workHours") {
        const m = computeWorkMinutes(s.workStart, s.workEnd);
        if (m !== null && m > 0) {
          value = m / 60;
          label = minutesToDurationLabel(m);
        }
      } else if (metric === "sleepDuration") {
        const m = computeSleepMinutes(s.wakeTime, s.bedTime);
        if (m !== null && m > 0) {
          value = m / 60;
          label = minutesToDurationLabel(m);
        }
      } else if (metric === "wakeTime") {
        const m = parseTimeToMinutes(s.wakeTime);
        if (m !== null) {
          value = m / 60;
          label = minutesToTimeLabel(m);
        }
      } else {
        const m = parseTimeToMinutes(s.bedTime);
        if (m !== null) {
          value = m / 60;
          label = minutesToTimeLabel(m);
        }
      }
      return { day, value, label };
    });
    return points;
  }, [keys, state.days, metric]);

  const summary = useMemo(() => {
    const workMins: number[] = [];
    const sleepMins: number[] = [];
    const wakeMins: number[] = [];
    for (const key of keys) {
      const s = mergeDayRecord(state.days[key]).schedule;
      const w = computeWorkMinutes(s.workStart, s.workEnd);
      const sl = computeSleepMinutes(s.wakeTime, s.bedTime);
      const wake = parseTimeToMinutes(s.wakeTime);
      if (w && w > 0) workMins.push(w);
      if (sl && sl > 0) sleepMins.push(sl);
      if (wake !== null) wakeMins.push(wake);
    }
    const totalWork = workMins.reduce((a, b) => a + b, 0);
    const avgWork = averageMinutes(workMins);
    const avgSleep = averageMinutes(sleepMins);
    const avgWake = averageMinutes(wakeMins);
    return {
      totalWork: totalWork / 60,
      avgWork: avgWork ? avgWork / 60 : null,
      avgSleep: avgSleep ? avgSleep / 60 : null,
      avgWake: avgWake !== null ? avgWake : null,
    };
  }, [keys, state.days]);

  function shiftMonth(delta: number) {
    let ny = jy;
    let nm = jm + delta;
    if (nm < 1) {
      nm = 12;
      ny -= 1;
    } else if (nm > 12) {
      nm = 1;
      ny += 1;
    }
    setJy(ny);
    setJm(nm);
  }

  const yFormatter = (v: number) => {
    if (metric === "wakeTime" || metric === "bedTime") {
      return minutesToTimeLabel(v * 60);
    }
    return toPersianDigits(v.toFixed(1));
  };

  return (
    <section className="panel chart-panel">
      <div className="panel-head wrap">
        <div>
          <h2>آمار ماهانه</h2>
          <p className="panel-sub">{jalaliMonthLabel(jy, jm)}</p>
        </div>
        <div className="chart-controls">
          <button type="button" className="ghost-btn" onClick={() => shiftMonth(-1)}>
            ماه قبل
          </button>
          <button type="button" className="ghost-btn" onClick={() => shiftMonth(1)}>
            ماه بعد
          </button>
          <select
            className="select-input"
            value={metric}
            onChange={(e) => setMetric(e.target.value as ChartMetric)}
            aria-label="انتخاب شاخص"
          >
            {(Object.keys(CHART_METRIC_LABELS) as ChartMetric[]).map((m) => (
              <option key={m} value={m}>
                {CHART_METRIC_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#dce9f5" />
            <XAxis
              dataKey="day"
              tickFormatter={(d) => toPersianDigits(d)}
              stroke="#8aa8c4"
              fontSize={12}
            />
            <YAxis tickFormatter={yFormatter} stroke="#8aa8c4" fontSize={12} width={48} />
            <Tooltip
              formatter={(v) => {
                if (v === undefined || v === null) return "—";
                const num = typeof v === "number" ? v : Number(v);
                if (!Number.isFinite(num)) return "—";
                if (metric === "wakeTime" || metric === "bedTime") {
                  return minutesToTimeLabel(num * 60);
                }
                return `${toPersianDigits(num.toFixed(2))} ساعت`;
              }}
              labelFormatter={(d) => `روز ${toPersianDigits(String(d))}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7eb8e8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#7eb8e8", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="summary-grid">
        <div>
          <p className="summary-label">مجموع ساعات کاری</p>
          <p className="summary-value">
            {toPersianDigits(summary.totalWork.toFixed(1))} ساعت
          </p>
        </div>
        <div>
          <p className="summary-label">میانگین کار روزانه</p>
          <p className="summary-value">
            {summary.avgWork !== null
              ? `${toPersianDigits(summary.avgWork.toFixed(1))} ساعت`
              : "—"}
          </p>
        </div>
        <div>
          <p className="summary-label">میانگین خواب</p>
          <p className="summary-value">
            {summary.avgSleep !== null
              ? `${toPersianDigits(summary.avgSleep.toFixed(1))} ساعت`
              : "—"}
          </p>
        </div>
        <div>
          <p className="summary-label">میانگین بیدار شدن</p>
          <p className="summary-value">
            {summary.avgWake !== null ? minutesToTimeLabel(summary.avgWake) : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}