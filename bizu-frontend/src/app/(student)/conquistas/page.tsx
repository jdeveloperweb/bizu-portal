"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Trophy, Star, Flame, Target, Zap, Sparkles,
    Crown, Sunrise, Play, Shield, Swords,
    CheckCircle2, BookOpen, Clock, TrendingUp,
    Layers, Brain, Award, Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { BadgeInsignia } from "@/components/gamification/BadgeInsignia";

type BadgeCategory = "todas" | "consistencia" | "performance" | "social" | "especial";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: typeof Trophy;
    iconStr: string;
    earned: boolean;
    category: BadgeCategory;
    xp: number;
    earnedDate?: string;
    progress?: number;
    requirement?: string;
    color: string;
}

const iconMap: Record<string, typeof Trophy> = {
    sunrise: Sunrise,
    flame: Flame,
    clock: Clock,
    target: Target,
    play: Play,
    swords: Swords,
    crown: Crown,
    layers: Layers,
    brain: Brain,
    checkCircle2: CheckCircle2,
    award: Award,
    zap: Zap,
    shield: Shield,
    star: Star,
    bookOpen: BookOpen,
    sparkles: Sparkles,
};

const categoryConfig: Record<BadgeCategory, { label: string; icon: typeof Trophy }> = {
    todas: { label: "Todas", icon: Award },
    consistencia: { label: "Consistencia", icon: Flame },
    performance: { label: "Performance", icon: Target },
    social: { label: "Social", icon: Swords },
    especial: { label: "Especial", icon: Sparkles },
};

export default function ConquistasPage() {
    const { isFree } = useAuth();
    const [activeCategory, setActiveCategory] = useState<BadgeCategory>("todas");
    const [badges, setBadges] = useState<Badge[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [badgesRes, statsRes] = await Promise.all([
                    apiFetch("/student/badges/me"),
                    apiFetch("/student/gamification/me")
                ]);

                if (badgesRes.ok) {
                    const data = await badgesRes.json();
                    const mappedData = data.map((b: any) => ({
                        id: b.id,
                        name: b.name,
                        description: b.description,
                        icon: iconMap[b.icon] || Trophy,
                        iconStr: b.icon,
                        earned: b.earned,
                        category: (b.category || "todas") as BadgeCategory,
                        xp: b.xp,
                        earnedDate: b.earnedDate ? new Date(b.earnedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : undefined,
                        progress: b.progress,
                        requirement: b.requirement,
                        color: b.color || "from-slate-400 to-slate-500",
                    }));

                    mappedData.sort((a: Badge, b: Badge) => {
                        if (a.earned && !b.earned) return -1;
                        if (!a.earned && b.earned) return 1;
                        return (b.progress || 0) - (a.progress || 0);
                    });
                    setBadges(mappedData);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (error) {
                console.error("Failed to fetch gamification data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredBadges = activeCategory === "todas" ? badges : badges.filter(b => b.category === activeCategory);
    const earnedCount = badges.filter(b => b.earned).length;
    const badgeXP = badges.filter(b => b.earned).reduce((a, b) => a + (b.xp || 0), 0);
    const totalXP = stats?.totalXp || badgeXP;
    const currentLevel = stats?.level || Math.floor(totalXP / 1000) + 1;

    if (loading) {
        return (
            <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Conquistas Premium"
                    description="O sistema de conquistas e gamificação é exclusivo para assinantes. Desbloqueie selos especiais durante sua jornada!"
                />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Gamificacao</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Conquistas
                    </h1>
                    <p className="text-sm text-slate-500">Cada selo representa um degrau na sua jornada rumo a aprovacao.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Trophy size={13} /> {earnedCount}/{badges.length}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Zap size={13} /> {totalXP} XP totais
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Badges obtidos", val: `${earnedCount}/${badges.length}`, icon: Trophy, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "XP acumulado", val: String(totalXP), icon: Zap, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Nivel atual", val: `Lv. ${currentLevel}`, icon: Star, bg: "bg-violet-50", text: "text-violet-600" },
                    { label: "Proximo badge", val: (badges.filter(b => !b.earned).sort((a, b) => (b.progress || 0) - (a.progress || 0))[0]?.progress || 0) + "%", icon: Target, bg: "bg-emerald-50", text: "text-emerald-600" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={13} className={s.text} />
                                </div>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide py-1">
                {(Object.entries(categoryConfig) as [BadgeCategory, typeof categoryConfig.todas][]).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                        <button key={key} onClick={() => setActiveCategory(key)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${activeCategory === key
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                }`}>
                            <Icon size={12} /> {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBadges.map(badge => (
                    <BadgeInsignia
                        key={badge.id}
                        name={badge.name}
                        description={badge.description}
                        icon={badge.icon}
                        earned={badge.earned}
                        color={badge.color}
                        progress={badge.progress}
                        requirement={badge.requirement}
                        xp={badge.xp}
                        earnedDate={badge.earnedDate}
                        variant="detailed"
                    />
                ))}
            </div>

            {filteredBadges.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <Trophy className="w-12 h-12 text-slate-300 mb-3" />
                    <p>Nenhuma conquista encontrada nesta categoria.</p>
                </div>
            )}
        </div>
    );
}
