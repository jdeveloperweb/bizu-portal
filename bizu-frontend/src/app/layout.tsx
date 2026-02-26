import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
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
  title: "Bizu! Portal — Plataforma #1 para Concursos",
  description:
    "A plataforma definitiva para concurseiros de elite. Simulados com IA, banco de 50k+ questoes e trilhas personalizadas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bizu! Portal",
  },
};

import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import BrandingLoader from "@/components/BrandingLoader";
import CourseSelectionGate from "@/components/CourseSelectionGate";
import PaywallGate from "@/components/PaywallGate";
import { AppearanceProvider } from "@/components/AppearanceProvider";
import { CourseProvider } from "@/contexts/CourseContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import FloatingPomodoro from "@/components/pomodoro/FloatingPomodoro";
import { GamificationProvider } from "@/components/gamification/GamificationProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} ${jetbrains.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <AuthProvider>
          <CourseProvider>
            <PomodoroProvider>
              <AppearanceProvider>
                <BrandingLoader />
                <NotificationProvider>
                  <CourseSelectionGate>
                    <PaywallGate>
                      <GamificationProvider>
                        {children}
                        <FloatingPomodoro />
                      </GamificationProvider>
                    </PaywallGate>
                  </CourseSelectionGate>
                </NotificationProvider>
              </AppearanceProvider>
            </PomodoroProvider>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
