import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Kalam, Caveat, Indie_Flower, Orbitron } from "next/font/google";
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

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const indieFlower = Indie_Flower({
  variable: "--font-indie",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Axon Portal — Plataforma #1 para Concursos",
  description:
    "A plataforma definitiva para concurseiros de elite. Simulados com IA, banco de 50k+ questoes e trilhas personalizadas.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-512x512.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Axon Academy",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
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
import { GamificationProvider } from "@/components/gamification/GamificationProvider";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import PWASplashScreen from "@/components/pwa/PWASplashScreen";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${jakarta.variable} ${jetbrains.variable} ${kalam.variable} ${caveat.variable} ${indieFlower.variable} ${orbitron.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <AuthProvider>
          <CourseProvider>
            <PomodoroProvider>
              <AppearanceProvider>
                <BrandingLoader />
                <PWASplashScreen />
                <NotificationProvider>
                  <CourseSelectionGate>
                    <PaywallGate>
                      <GamificationProvider>
                        {children}
                        <InstallPWA />
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
