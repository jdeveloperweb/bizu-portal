"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "auto";

interface AppearanceContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    compactMode: boolean;
    setCompactMode: (compact: boolean) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [compactMode, setCompactModeState] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const savedTheme = localStorage.getItem("bizu-theme") as Theme;
        const savedCompact = localStorage.getItem("bizu-compact") === "true";

        if (savedTheme) setThemeState(savedTheme);
        if (savedCompact) setCompactModeState(savedCompact);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;

        // Theme handling
        const applyTheme = (t: Theme) => {
            root.classList.remove("light", "dark");

            let actualTheme = t;
            if (t === "auto") {
                actualTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }

            root.classList.add(actualTheme);
            root.style.colorScheme = actualTheme;
        };

        applyTheme(theme);

        // Watch for system theme changes if set to auto
        if (theme === "auto") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme("auto");
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        if (compactMode) {
            root.classList.add("compact-mode");
        } else {
            root.classList.remove("compact-mode");
        }
    }, [compactMode]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("bizu-theme", t);
    };

    const setCompactMode = (c: boolean) => {
        setCompactModeState(c);
        localStorage.setItem("bizu-compact", String(c));
    };

    return (
        <AppearanceContext.Provider value={{ theme, setTheme, compactMode, setCompactMode }}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error("useAppearance must be used within an AppearanceProvider");
    }
    return context;
}
