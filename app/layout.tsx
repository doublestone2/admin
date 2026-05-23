import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "교통사고 합의대행 CRM",
  description: "Traffic accident settlement CRM admin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
