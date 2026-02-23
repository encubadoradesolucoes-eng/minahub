import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MineHub",
  description: "Gestão de mineração e finanças",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  viewport: { width: "device-width", initialScale: 1, maximumScale: 5 },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={plusJakarta.variable}>
      <body className="font-sans antialiased min-h-screen bg-slate-950 text-slate-200">
        {children}
      </body>
    </html>
  );
}
