import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "교통사고 합의대행 CRM",
  description: "Traffic accident settlement CRM admin"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <SpeedInsights debug sampleRate={1} />
      </body>
    </html>
  );
}