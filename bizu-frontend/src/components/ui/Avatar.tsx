"use client";

import { useState } from "react";
import { getAvatarUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";
import { RankInsignia } from "../gamification/RankInsignia";

interface AvatarProps {
    src?: string;
    name?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    fallbackClassName?: string;
    rankLevel?: number;
    activeAura?: string | null;
    activeBorder?: string | null;
}

export function Avatar({ src, name, className, size = "md", fallbackClassName, rankLevel, activeAura, activeBorder }: AvatarProps) {
    const [hasError, setHasError] = useState(false);

    const getInitials = (n: string) => {
        if (!n) return "?";
        const parts = n.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase().substring(0, 2);
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    const sizeClasses = {
        sm: "w-8 h-8 rounded-lg text-[10px]",
        md: "w-10 h-10 rounded-xl text-sm",
        lg: "w-12 h-12 rounded-2xl text-base",
        xl: "w-24 h-24 rounded-3xl text-2xl",
    };

    const insigniaSize = {
        sm: "sm",
        md: "sm",
        lg: "md",
        xl: "lg",
    } as const;

    const initials = name ? getInitials(name) : "?";

    const Fallback = () => (
        <div
            className={cn(
                "flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-extrabold border shrink-0 transition-all",
                sizeClasses[size],
                activeBorder === "RAINBOW" ? "border-transparent" : "border-indigo-200/50",
                className,
                fallbackClassName
            )}
        >
            {initials}
        </div>
    );

    // Aura Styles (Glow)
    const auraStyles = {
        GOLD: "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-yellow-400/20 after:blur-md after:animate-pulse",
        BLUE: "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-cyan-400/20 after:blur-md after:animate-pulse",
    }[activeAura || ""] || "";

    // Border Styles (Animated Gradient)
    const borderStyles = {
        RAINBOW: "before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-gradient-to-tr before:from-red-500 before:via-green-500 before:to-blue-500 before:animate-[spin_3s_linear_infinite] before:p-[2px] after:absolute after:inset-0 after:rounded-[inherit] after:bg-inherit after:z-[1]",
    }[activeBorder || ""] || "";

    return (
        <div className={cn(
            "relative inline-block shrink-0",
            auraStyles
        )}>
            <div className={cn(
                "relative z-10 rounded-[inherit] overflow-hidden bg-white",
                borderStyles,
                sizeClasses[size],
                className
            )}>
                {(!src || hasError) ? (
                    <Fallback />
                ) : (
                    <div className={cn(
                        "relative z-[2] w-full h-full overflow-hidden rounded-[inherit] shadow-sm border border-transparent",
                    )}>
                        <img
                            src={getAvatarUrl(src)}
                            className="w-full h-full object-cover"
                            alt={name || "Avatar"}
                            onError={() => setHasError(true)}
                        />
                    </div>
                )}
            </div>

            {rankLevel !== undefined && (
                <div className={cn(
                    "absolute z-[20]",
                    size === "sm" ? "-bottom-1 -right-1" :
                        size === "md" ? "-bottom-1.5 -right-1.5" :
                            size === "lg" ? "-bottom-2 -right-2" :
                                "-bottom-3 -right-3"
                )}>
                    <RankInsignia level={rankLevel} size={insigniaSize[size]} className="bg-white rounded-full p-0.5 border border-slate-100 shadow-md ring-2 ring-white" />
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
