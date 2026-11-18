"use client";

import { useState } from "react";
import { usePlanner } from "@/lib/planner/context";

export function TasksSection() {
  const { selectedDay, addTask, toggleTask, updateTask, removeTask } = usePlanner();
  const [text, setText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    addTask(text);
    setText("");
  }

  function startEdit(id: string, value: string) {
    setEditId(id);
    setEditText(value);
  }

  function saveEdit(id: string) {
    updateTask(id, editText);
    setEditId(null);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>وظایف روز</h2>
      </div>
      <form className="inline-form" onSubmit={onAdd}>
        <input
          required
          placeholder="وظیفه جدید"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="primary-btn">
          افزودن
        </button>
      </form>
      {selectedDay.tasks.length === 0 ? (
        <p className="empty-note">وظیفه‌ای برای این روز نیست.</p>
      ) : (
        <ul className="task-list">
          {selectedDay.tasks.map((t) => (
            <li key={t.id} className={t.completed ? "done" : ""}>
              <label className="task-check">
                <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} />
                {editId === t.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(t.id);
                      if (e.key === "Escape") setEditId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span>{t.text}</span>
                )}
              </label>
              <div className="row-actions">
                <button type="button" className="ghost-btn" onClick={() => startEdit(t.id, t.text)}>
                  ویرایش
                </button>
                <button type="button" className="ghost-btn danger" onClick={() => removeTask(t.id)}>
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