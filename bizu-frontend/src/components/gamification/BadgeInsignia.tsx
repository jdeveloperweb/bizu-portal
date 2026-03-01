"use client";

import { LucideIcon, Trophy, CheckCircle2, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeInsigniaProps {
    name: string;
    description?: string;
    icon: any; // LucideIcon or any component
    earned: boolean;
    color?: string; // Gradient string like "from-orange-400 to-rose-500"
    progress?: number;
    requirement?: string;
    xp?: number;
    earnedDate?: string;
    variant?: "compact" | "detailed";
    className?: string;
}

export function BadgeInsignia({
    name,
    description,
    icon: Icon = Trophy,
    earned,
    color = "from-slate-400 to-slate-500",
    progress = 0,
    requirement,
    xp,
    earnedDate,
    variant = "detailed",
    className,
}: BadgeInsigniaProps) {
    const isDetailed = variant === "detailed";

    // Visual styles based on state
    const bgGradient = earned ? color : "from-slate-100 to-slate-200";
    const iconColor = earned ? "text-white" : "text-slate-400";
    const borderColor = earned ? "border-white/20" : "border-slate-200";

    if (!isDetailed) {
        return (
            <div className={cn("group relative", className)}>
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "relative aspect-square rounded-2xl flex items-center justify-center p-3 transition-all duration-500 overflow-hidden shadow-sm",
                        earned
                            ? `bg-gradient-to-br ${color} shadow-lg shadow-indigo-200/50`
                            : "bg-slate-50 border border-slate-100"
                    )}
                >
                    {/* Inner Glass Effect for Earned Badges */}
                    {earned && (
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}

                    {/* Glossy Overlay */}
                    {earned && (
                        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/30 via-transparent to-transparent rotate-45 group-hover:animate-[shine_2s_infinite] pointer-events-none" />
                    )}

                    <Icon
                        size={earned ? 22 : 18}
                        className={cn("relative z-10 transition-all duration-500", iconColor, earned && "drop-shadow-md")}
                    />

                    {!earned && progress > 0 && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-200 overflow-hidden">
                            <div
                                className={cn("h-full bg-gradient-to-r", color)}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </motion.div>

                {/* Simplified Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10">
                    <p className="font-black tracking-tight">{name}</p>
                    {!earned && <p className="text-[9px] text-slate-400 font-bold uppercase">{progress}% completo</p>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "group card-elevated !rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500",
            !earned ? "bg-white/50 border-dashed border-slate-200" : "bg-white border-transparent",
            className
        )}>
            <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                    {/* Visual Aura for Earned Badges */}
                    {earned && (
                        <div className={cn(
                            "absolute -inset-2 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse bg-gradient-to-r",
                            color
                        )} />
                    )}

                    <div className={cn(
                        "relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 overflow-hidden",
                        earned
                            ? `bg-gradient-to-br ${color} shadow-xl shadow-indigo-100/50 scale-100 group-hover:scale-110 group-hover:rotate-6`
                            : "bg-slate-50 border border-slate-100"
                    )}>
                        {/* Shine effect */}
                        {earned && (
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}

                        <Icon
                            size={earned ? 30 : 24}
                            className={cn("relative z-10 transition-all duration-500", iconColor, earned && "drop-shadow-lg")}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                            "text-[15px] font-black tracking-tight transition-colors",
                            earned ? "text-slate-900" : "text-slate-400"
                        )}>
                            {name}
                        </span>
                        {earned ? (
                            <CheckCircle2 size={14} className="text-emerald-500 fill-emerald-50" />
                        ) : (
                            <Lock size={12} className="text-slate-300" />
                        )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 group-hover:text-slate-700 transition-colors">
                        {description}
                    </p>

                    {earned ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full">
                                <Zap size={10} className="text-indigo-600 fill-indigo-200" />
                                <span className="text-[10px] font-black text-indigo-700">+{xp} XP</span>
                            </div>
                            {earnedDate && (
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-widest">{earnedDate}</span>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", color)}
                                    />
                                </div>
                                <span className="text-[11px] font-black text-slate-400 tabular-nums">{progress}%</span>
                            </div>
                            {requirement && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    {requirement}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Decorative Corner */}
            {earned && (
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Trophy size={40} className="text-slate-900" />
                </div>
            )}
        </div>
    );
}
