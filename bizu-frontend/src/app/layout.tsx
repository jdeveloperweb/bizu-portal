import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

/* Inter: fonte moderna e legível para todo o sistema */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Bizu! Portal — Excelência em Concursos",
  description:
    "O portal definitivo para concurseiros de elite. Simulados inteligentes, banco de questões e trilhas personalizadas para sua aprovação.",
  manifest: "/manifest.json",
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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <BrandingLoader />
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
