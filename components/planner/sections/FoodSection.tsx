"use client";

import { useState } from "react";
import { toPersianDigits } from "@/lib/planner/dates";
import { usePlanner } from "@/lib/planner/context";

export function FoodSection() {
  const { selectedDay, addFood, updateFood, removeFood } = usePlanner();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [calories, setCalories] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const total = selectedDay.foods.reduce((s, f) => s + f.calories, 0);

  function resetForm() {
    setName("");
    setQuantity("");
    setCalories("");
    setEditId(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, quantity, calories: Number(calories) };
    if (editId) updateFood(editId, payload);
    else addFood(payload);
    resetForm();
  }

  function startEdit(id: string) {
    const row = selectedDay.foods.find((f) => f.id === id);
    if (!row) return;
    setEditId(id);
    setName(row.name);
    setQuantity(row.quantity);
    setCalories(String(row.calories));
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>غذا و کالری</h2>
        <span className="badge">مجموع: {toPersianDigits(total)} kcal</span>
      </div>
      <form className="inline-form" onSubmit={submit}>
        <input
          required
          placeholder="نام غذا یا نوشیدنی"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        <input
          placeholder="مقدار"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          maxLength={40}
        />
        <input
          type="number"
          min={0}
          required
          placeholder="کالری"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
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
      {selectedDay.foods.length === 0 ? (
        <p className="empty-note">موردی ثبت نشده.</p>
      ) : (
        <ul className="data-list">
          {selectedDay.foods.map((f) => (
            <li key={f.id}>
              <div>
                <strong>{f.name}</strong>
                <span className="muted">
                  {" "}
                  — {f.quantity || "—"} · {toPersianDigits(f.calories)} kcal
                </span>
              </div>
              <div className="row-actions">
                <button type="button" className="ghost-btn" onClick={() => startEdit(f.id)}>
                  ویرایش
                </button>
                <button type="button" className="ghost-btn danger" onClick={() => removeFood(f.id)}>
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