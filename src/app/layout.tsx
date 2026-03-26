import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const ibmPlexSansKR = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HabitCircle — 습관서클",
  description: "함께 만드는 작은 습관의 힘. 친구와 서클에서 매일의 습관을 기록하고 공유하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${ibmPlexSansKR.variable} ${outfit.variable}`}>
      <body className="font-sans bg-cream text-charcoal min-h-dvh">
        {children}
      </body>
    </html>
  );
}
