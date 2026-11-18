"use client";

import { useState } from "react";
import { toPersianDigits } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/lib/planner/types";

export function ExpensesSection() {
  const { selectedDay, selectedDateKey, addExpense, updateExpense, removeExpense, stats } =
    usePlanner();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const dayTotal = selectedDay.expenses.reduce((s, e) => s + e.amount, 0);

  function resetForm() {
    setAmount("");
    setDescription("");
    setEditId(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { amount: Number(amount), category, description };
    if (editId) updateExpense(editId, payload);
    else addExpense(payload);
    resetForm();
  }

  function startEdit(id: string) {
    const row = selectedDay.expenses.find((x) => x.id === id);
    if (!row) return;
    setEditId(id);
    setAmount(String(row.amount));
    setCategory(row.category);
    setDescription(row.description);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>هزینه‌ها</h2>
        <div className="mini-stats">
          <span>روز جاری: {toPersianDigits(Math.round(dayTotal).toLocaleString("en-US"))} تومان</span>
          <span>
            ماه: {toPersianDigits(Math.round(stats.monthExpensesForSelectedDayMonth).toLocaleString("en-US"))}{" "}
            تومان
          </span>
        </div>
      </div>
      <form className="inline-form" onSubmit={submit}>
        <input
          type="number"
          min={1}
          required
          placeholder="مبلغ (تومان)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
          {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((k) => (
            <option key={k} value={k}>
              {EXPENSE_CATEGORY_LABELS[k]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="توضیح کوتاه"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={120}
        />
        <button type="submit" className="primary-btn">
          {editId ? "ذخیره" : "افزودن"}
        </button>
        {editId && (
          <button type="button" className="ghost-btn" onClick={resetForm}>
            لغو
          </button>
        )}
      </form>
      {selectedDay.expenses.length === 0 ? (
        <p className="empty-note">هزینه‌ای برای {selectedDateKey ? "این روز" : "امروز"} ثبت نشده.</p>
      ) : (
        <ul className="data-list">
          {selectedDay.expenses.map((e) => (
            <li key={e.id}>
              <div>
                <strong>{toPersianDigits(Math.round(e.amount).toLocaleString("en-US"))} تومان</strong>
                <span className="muted"> — {EXPENSE_CATEGORY_LABELS[e.category]}</span>
                {e.description && <p className="muted small">{e.description}</p>}
              </div>
              <div className="row-actions">
                <button type="button" className="ghost-btn" onClick={() => startEdit(e.id)}>
                  ویرایش
                </button>
                <button type="button" className="ghost-btn danger" onClick={() => removeExpense(e.id)}>
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}