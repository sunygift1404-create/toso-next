"use client";

import { useRef } from "react";
import { usePlanner } from "@/lib/planner/context";

const MAX_BYTES = 900_000;

export function PhotoSection() {
  const { selectedDay, addPhoto, removePhoto } = usePlanner();
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_BYTES) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") addPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>عکس‌های روز</h2>
        <button type="button" className="primary-btn small" onClick={() => inputRef.current?.click()}>
          افزودن عکس
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>
      {selectedDay.photos.length === 0 ? (
        <p className="empty-note">هنوز عکسی برای این روز ثبت نشده.</p>
      ) : (
        <div className="photo-grid">
          {selectedDay.photos.map((p) => (
            <figure key={p.id} className="photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt="عکس روز" />
              <div className="photo-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (!file || file.size > MAX_BYTES) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          removePhoto(p.id);
                          addPhoto(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  جایگزین
                </button>
                <button type="button" className="ghost-btn danger" onClick={() => removePhoto(p.id)}>
                  حذف
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}