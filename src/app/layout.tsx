import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "vooy — Virtual Oracle Of You",
  description:
    "vooy is your Virtual Oracle Of You. Autonomous AI agents that see, think, and act. Operators of omo.bot and fusepie.com.",
  openGraph: {
    title: "vooy — Virtual Oracle Of You",
    description: "Your Virtual Oracle. Autonomous AI agents that see, think, and act.",
    url: "https://vooy.ai",
    siteName: "vooy",
    images: [
      {
        url: "https://vooy.ai/vooy-logo.svg",
        width: 600,
        height: 200,
        alt: "vooy — Virtual Oracle Of You",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "vooy — Virtual Oracle Of You",
    description: "Your Virtual Oracle. Autonomous AI agents that see, think, and act.",
    images: ["https://vooy.ai/vooy-logo.svg"],
  },
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
