"use client";

import { useState } from "react";
import { getAvatarUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface AvatarProps {
    src?: string;
    name?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
    fallbackClassName?: string;
}

export function Avatar({ src, name, className, size = "md", fallbackClassName }: AvatarProps) {
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

    const initials = name ? getInitials(name) : "?";

    const Fallback = () => (
        <div
            className={cn(
                "flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 font-extrabold border border-indigo-200/50 shadow-sm shrink-0",
                sizeClasses[size],
                className,
                fallbackClassName
            )}
        >
            {initials}
        </div>
    );

    if (!src || hasError) {
        return <Fallback />;
    }

    return (
        <div className={cn("overflow-hidden shrink-0 shadow-sm border border-transparent", sizeClasses[size], className)}>
            <img
                src={getAvatarUrl(src)}
                className="w-full h-full object-cover"
                alt={name || "Avatar"}
                onError={() => setHasError(true)}
            />
        </div>
    );
}
