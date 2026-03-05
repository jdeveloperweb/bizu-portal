"use client";

import { cn } from "@/lib/utils";
import {
    Shield, ShieldCheck, ChevronUp, ChevronsUp,
    Star, StarHalf, Crown, Award, Trophy, Circle,
    LucideIcon
} from "lucide-react";

interface RankInsigniaProps {
    level: number;
    rank?: string;
    className?: string;
    showName?: boolean;
    size?: "sm" | "md" | "lg";
}

export function RankInsignia({ level, rank, className, showName = false, size = "md" }: RankInsigniaProps) {
    let Icon: LucideIcon = Circle;
    let colorClass = "text-slate-400 bg-slate-100";

    // Determine Icon based on level (Military Hierarchy)
    if (level <= 2) { Icon = Circle; colorClass = "text-slate-400 bg-slate-50"; }
    else if (level <= 5) { Icon = Shield; colorClass = "text-slate-500 bg-slate-100"; }
    else if (level <= 8) { Icon = ShieldCheck; colorClass = "text-slate-600 bg-slate-200"; }
    else if (level <= 12) { Icon = ChevronUp; colorClass = "text-indigo-400 bg-indigo-50"; }
    else if (level <= 16) { Icon = ChevronsUp; colorClass = "text-indigo-500 bg-indigo-100"; }
    else if (level <= 20) { Icon = ChevronsUp; colorClass = "text-indigo-600 bg-indigo-100 ring-2 ring-indigo-200"; }
    else if (level <= 25) { Icon = StarHalf; colorClass = "text-amber-500 bg-amber-50"; }
    else if (level <= 40) { Icon = Star; colorClass = "text-amber-600 bg-amber-100"; }
    else if (level <= 55) { Icon = Crown; colorClass = "text-purple-600 bg-purple-50"; }
    else if (level <= 70) { Icon = Award; colorClass = "text-red-500 bg-red-50"; }
    else if (level <= 85) { Icon = Trophy; colorClass = "text-yellow-600 bg-yellow-50 shadow-inner"; }
    else { Icon = Crown; colorClass = "text-yellow-500 bg-slate-900 border-yellow-400 border shadow-[0_0_10px_rgba(234,179,8,0.3)]"; }

    const sizeClasses = {
        sm: "w-6 h-6 p-1",
        md: "w-10 h-10 p-2",
        lg: "w-16 h-16 p-3.5"
    };

    const iconSizes = {
        sm: 12,
        md: 20,
        lg: 32
    };

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className={cn(
                "rounded-[14px] flex items-center justify-center transition-all duration-500",
                sizeClasses[size],
                colorClass
            )}>
                <Icon size={iconSizes[size]} className="animate-in zoom-in-50 duration-500" />
            </div>
            {showName && (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Patente
                    </span>
                    <span className="text-sm font-black text-slate-800 leading-none">
                        {rank || "Recruta"}
                    </span>
                </div>
            )}
        </div>
    );
}
