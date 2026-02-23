import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bizu! Portal - Excelência em Concursos",
  description: "O portal definitivo para concurseiros de elite. Flashcards, Simulados e Arena de Duelos.",
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bizu! Portal",
  },
};

import { NotificationProvider } from "@/components/NotificationProvider";
import BrandingLoader from "@/components/BrandingLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BrandingLoader />
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
