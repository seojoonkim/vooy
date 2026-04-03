import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "vxxv — Agentic AI Systems",
  description:
    "Building autonomous AI agents that see, think, and act. Operators of omo.bot and fusepie.com.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg-primary text-text-primary font-mono">
        {children}
      </body>
    </html>
  );
}
