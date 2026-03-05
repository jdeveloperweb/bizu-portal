"use client";

import { useState, useMemo } from "react";
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

// Vibrant gradients — assigned deterministically by name so each user always gets the same color
const GRADIENTS: [string, string][] = [
    ["#6366f1", "#8b5cf6"], // indigo → violet
    ["#0ea5e9", "#3b82f6"], // sky → blue
    ["#10b981", "#14b8a6"], // emerald → teal
    ["#f59e0b", "#f97316"], // amber → orange
    ["#ef4444", "#ec4899"], // red → pink
    ["#8b5cf6", "#d946ef"], // violet → fuchsia
    ["#06b6d4", "#6366f1"], // cyan → indigo
    ["#84cc16", "#10b981"], // lime → emerald
];

function getGradient(name: string): [string, string] {
    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return GRADIENTS[hash % GRADIENTS.length];
}

function getInitials(name: string): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
}

// Only treat src as a real image URL if it looks like one
function isImageUrl(src?: string): boolean {
    if (!src) return false;
    return src.startsWith("http") || src.startsWith("/") || src.length > 4;
}

export function Avatar({
    src,
    name,
    className,
    size = "md",
    fallbackClassName,
    rankLevel,
    activeAura,
    activeBorder,
}: AvatarProps) {
    const [hasError, setHasError] = useState(false);

    const sizeClasses = {
        sm: "w-8 h-8 rounded-lg text-[10px]",
        md: "w-10 h-10 rounded-xl text-[11px]",
        lg: "w-12 h-12 rounded-2xl text-sm",
        xl: "w-24 h-24 rounded-3xl text-xl",
    };

    const badgeSize = {
        sm: "xxs",
        md: "xs",
        lg: "sm",
        xl: "md",
    } as const;

    const badgeOffset = {
        sm: "-bottom-0.5 -right-0.5",
        md: "-bottom-1 -right-1",
        lg: "-bottom-1 -right-1",
        xl: "-bottom-2 -right-2",
    };

    const initials = useMemo(() => getInitials(name || "?"), [name]);
    const [fromColor, toColor] = useMemo(() => getGradient(name || "?"), [name]);

    const validSrc = isImageUrl(src) ? src : undefined;
    const showImage = !!validSrc && !hasError;

    // Aura glow effect
    const auraStyle = activeAura === "GOLD"
        ? "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-yellow-400/20 after:blur-md after:animate-pulse"
        : activeAura === "BLUE"
            ? "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-cyan-400/20 after:blur-md after:animate-pulse"
            : "";

    // Animated rainbow border
    const borderStyle = activeBorder === "RAINBOW"
        ? "before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-gradient-to-tr before:from-red-500 before:via-green-500 before:to-blue-500 before:animate-[spin_3s_linear_infinite] after:absolute after:inset-0 after:rounded-[inherit] after:bg-inherit after:z-[1]"
        : "";

    return (
        <div className={cn("relative inline-block shrink-0", auraStyle)}>
            <div className={cn(
                "relative z-10 overflow-hidden shrink-0",
                sizeClasses[size],
                borderStyle,
                className,
            )}>
                {showImage ? (
                    <img
                        src={getAvatarUrl(validSrc)}
                        className="w-full h-full object-cover"
                        alt={name || "Avatar"}
                        onError={() => setHasError(true)}
                    />
                ) : (
                    <div
                        className={cn(
                            "w-full h-full flex items-center justify-center font-extrabold text-white select-none relative z-[2]",
                            fallbackClassName,
                        )}
                        style={{
                            background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
                        }}
                    >
                        {initials}
                    </div>
                )}
            </div>

            {rankLevel !== undefined && (
                <div className={cn("absolute z-[20]", badgeOffset[size])}>
                    <RankInsignia
                        level={rankLevel}
                        size={badgeSize[size]}
                        className="bg-white rounded-lg shadow-md ring-1 ring-white/80"
                    />
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
