import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "روزنو | برنامه‌ریز شخصی",
  description: "داشبورد برنامه‌ریزی روزانه با تقویم شمسی و آمار زندگی شخصی",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}