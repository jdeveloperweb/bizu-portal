"use client";

import { useState, useMemo, useEffect } from "react";
import { getAvatarUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";
import { RankInsignia } from "../gamification/RankInsignia";
import { AvatarEffects } from "./AvatarEffects";

interface AvatarProps {
    src?: string;
    name?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    fallbackClassName?: string;
    rankLevel?: number;
    activeAura?: string | null;
    activeBorder?: string | null;
    auraMetadata?: any;
    borderMetadata?: any;
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
    // Handle both string paths and blobs/urls with query params
    return src.startsWith("http") || src.startsWith("/") || src.startsWith("blob:") || src.length > 4;
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
    auraMetadata,
    borderMetadata,
}: AvatarProps) {
    const [hasError, setHasError] = useState(false);

    // Reset error state when src changes (e.g. user selects a new photo for preview)
    useEffect(() => {
        setHasError(false);
    }, [src]);

    const sizeClasses = {
        sm: "w-8 h-8 text-[10px]",
        md: "w-10 h-10 text-[11px]",
        lg: "w-12 h-12 text-sm",
        xl: "w-24 h-24 text-xl",
    };

    const roundingClasses = {
        sm: "rounded-lg",
        md: "rounded-xl",
        lg: "rounded-2xl",
        xl: "rounded-3xl",
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

    // Aura glow effect - Improved to look more like a glowing border
    const auraStyle = activeAura === "GOLD"
        ? "after:absolute after:inset-[-3px] after:rounded-[inherit] after:bg-yellow-400 after:blur-[4px] after:animate-pulse before:absolute before:inset-[-6px] before:rounded-[inherit] before:bg-yellow-400/20 before:blur-xl before:animate-pulse"
        : activeAura === "BLUE"
            ? "after:absolute after:inset-[-3px] after:rounded-[inherit] after:bg-cyan-400 after:blur-[4px] after:animate-pulse before:absolute before:inset-[-6px] before:rounded-[inherit] before:bg-cyan-400/20 before:blur-xl before:animate-pulse"
            : "";

    // Animated rainbow border
    const borderStyle = activeBorder === "RAINBOW" || borderMetadata?.visual?.borderStyle === "rainbow"
        ? "before:absolute before:inset-[-2px] before:rounded-[inherit] before:bg-gradient-to-tr before:from-red-500 before:via-green-500 before:to-blue-500 before:animate-[spin_3s_linear_infinite] after:absolute after:inset-0 after:rounded-[inherit] after:bg-inherit after:z-[1]"
        : "";

    // Merge metadata if available
    const combinedMetadata = useMemo(() => {
        const meta = { ...auraMetadata?.visual, ...borderMetadata?.visual };
        if (activeAura === "GOLD" && !auraMetadata) {
            meta.auraColor = "#fbbf24";
            meta.auraStyle = "pulse";
            meta.glowSize = 4;
        }
        if (activeAura === "BLUE" && !auraMetadata) {
            meta.auraColor = "#22d3ee";
            meta.auraStyle = "pulse";
            meta.glowSize = 4;
        }
        return Object.keys(meta).length > 0 ? meta : null;
    }, [activeAura, auraMetadata, borderMetadata]);

    // Force refresh image if it's external and we suspect an update
    const finalSrc = useMemo(() => {
        if (!validSrc) return undefined;
        let url = getAvatarUrl(validSrc);
        // If it's a relative path from our API, we only add cache buster if it's not a blob
        if (url && !url.startsWith('blob:') && !url.includes('?v=')) {
            // We use a small trick: add a version based on the hour to avoid extreme refetching 
            // but still allow daily/session updates, or the user can pass it.
            // Since we can't easily get the 'me' update time here without major refactor,
            // we'll at least make the URL clean and handled.
            return url;
        }
        return url;
    }, [validSrc]);

    const hasRainbow = activeBorder?.toUpperCase() === "RAINBOW" || borderMetadata?.visual?.borderStyle === "rainbow";
    const hasAura = activeAura?.toUpperCase() === "GOLD" || activeAura?.toUpperCase() === "BLUE" || !!combinedMetadata?.auraColor;

    // Outer Aura Glow (outside the box)
    const isGold = activeAura?.toUpperCase() === "GOLD" || combinedMetadata?.auraColor?.toLowerCase() === "#fbbf24";
    const isBlue = activeAura?.toUpperCase() === "BLUE" || combinedMetadata?.auraColor?.toLowerCase() === "#22d3ee";

    const auraEffectClass = isGold
        ? "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-yellow-400/40 after:blur-md after:animate-pulse before:absolute before:inset-[-8px] before:rounded-[inherit] before:bg-yellow-400/15 before:blur-xl before:animate-pulse"
        : isBlue
            ? "after:absolute after:inset-[-4px] after:rounded-[inherit] after:bg-cyan-400/40 after:blur-md after:animate-pulse before:absolute before:inset-[-8px] before:rounded-[inherit] before:bg-cyan-400/15 before:blur-xl before:animate-pulse"
            : "";

    const roundingClass = className?.includes("rounded-full") ? "rounded-full" : roundingClasses[size];

    return (
        <div className={cn("relative inline-block shrink-0", roundingClass, auraEffectClass)}>
            {/* 1. LAYER DE FUNDO: Efeitos de Borda (atrás de tudo) */}
            <div className="absolute inset-0 z-0 rounded-[inherit]">
                <AvatarEffects metadata={combinedMetadata} size={size} />

                {/* Arco-íris animado ligeiramente maior para criar a borda externa */}
                {hasRainbow && (
                    <div className="absolute inset-[-3.5px] rounded-[inherit] overflow-hidden">
                        <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,red,orange,yellow,green,blue,indigo,violet,red)] animate-[spin_4s_linear_infinite]" />
                    </div>
                )}

                {/* Aura sólida na borda */}
                {hasAura && !hasRainbow && (
                    <div className={cn(
                        "absolute inset-[-3.5px] rounded-[inherit] animate-pulse",
                        isGold ? "bg-yellow-400" : "bg-cyan-400"
                    )} />
                )}
            </div>

            {/* 2. LAYER DE FRENTE: Foto/Iniciais (z-10) */}
            <div className={cn(
                "relative z-10 shrink-0 bg-white dark:bg-slate-900 overflow-hidden rounded-[inherit]",
                sizeClasses[size],
                className,
            )}>
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden rounded-[inherit]">
                    {showImage ? (
                        <img
                            src={finalSrc}
                            className="w-full h-full object-cover relative z-20"
                            alt={name || "Avatar"}
                            onError={() => setHasError(true)}
                        />
                    ) : (
                        <div
                            className={cn(
                                "w-full h-full flex items-center justify-center font-extrabold text-white select-none relative z-20",
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
