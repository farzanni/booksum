import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "خلاصه‌کتاب | BookSum",
  description: "خلاصه‌های فارسی بهترین کتاب‌های جهان",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Vazirmatn Persian webfont (falls back to Tahoma if blocked) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
