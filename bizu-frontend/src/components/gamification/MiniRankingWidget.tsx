"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Zap, Crown, Medal, Award, TrendingUp, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

interface RankEntry {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
    rank: number;
    level?: number;
    value: number; // wins / best_score / weekly_xp
}

type TabKey = "duelos" | "simulados" | "semanal";

interface Tab {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    endpoint: string;
    valueKey: string;
    valueLabel: string;
    color: string;
    accent: string;
    emptyMsg: string;
}

const TABS: Tab[] = [
    {
        key: "duelos",
        label: "Arena",
        icon: Swords,
        endpoint: "/student/ranking/duelos?limit=3",
        valueKey: "wins",
        valueLabel: "vitórias",
        color: "from-violet-500 to-purple-600",
        accent: "text-violet-600",
        emptyMsg: "Nenhum duelo concluído ainda",
    },
    {
        key: "simulados",
        label: "Simulado",
        icon: Trophy,
        endpoint: "/student/ranking/simulados?limit=3",
        valueKey: "best_score",
        valueLabel: "pts",
        color: "from-amber-400 to-orange-500",
        accent: "text-amber-600",
        emptyMsg: "Nenhum simulado realizado ainda",
    },
    {
        key: "semanal",
        label: "Semana",
        icon: Zap,
        endpoint: "/student/ranking/semanal?limit=3",
        valueKey: "weekly_xp",
        valueLabel: "XP",
        color: "from-indigo-500 to-blue-600",
        accent: "text-indigo-600",
        emptyMsg: "Nenhuma atividade esta semana",
    },
];

function buildEndpoint(tab: Tab): string {
    const courseId = getStoredSelectedCourseId();
    const base = tab.endpoint;
    if (!courseId) return base;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}courseId=${courseId}`;
}

const MEDAL_CONFIG = [
    { Icon: Crown, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-500", ring: "ring-amber-200" },
    { Icon: Medal, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-400", ring: "ring-slate-200" },
    { Icon: Award, bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-400", ring: "ring-orange-200" },
];

function parseEntry(raw: any, tab: Tab): RankEntry {
    const avatarUrl = raw.avatar || "";
    const initials = (raw.name || "?")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    return {
        id: raw.id,
        name: raw.name || "Usuário",
        nickname: raw.nickname,
        avatar: avatarUrl || initials,
        rank: Number(raw.rank ?? 0),
        level: Number(raw.level ?? 1),
        value: Number(raw[tab.valueKey] ?? 0),
    };
}

export function MiniRankingWidget() {
    const [activeTab, setActiveTab] = useState<TabKey>("duelos");
    const [data, setData] = useState<Record<TabKey, RankEntry[] | null>>({
        duelos: null,
        simulados: null,
        semanal: null,
    });
    const [loading, setLoading] = useState<Record<TabKey, boolean>>({
        duelos: true,
        simulados: false,
        semanal: false,
    });

    const fetchTab = async (tabKey: TabKey) => {
        if (data[tabKey] !== null) return; // already fetched
        const tab = TABS.find(t => t.key === tabKey)!;
        setLoading(prev => ({ ...prev, [tabKey]: true }));
        try {
            const res = await apiFetch(buildEndpoint(tab));
            if (res.ok) {
                const raw = await res.json();
                const parsed = raw.map((r: any) => parseEntry(r, tab));
                setData(prev => ({ ...prev, [tabKey]: parsed }));
            } else {
                setData(prev => ({ ...prev, [tabKey]: [] }));
            }
        } catch {
            setData(prev => ({ ...prev, [tabKey]: [] }));
        } finally {
            setLoading(prev => ({ ...prev, [tabKey]: false }));
        }
    };

    // Prefetch duelos on mount
    useEffect(() => { fetchTab("duelos"); }, []);

    const handleTabChange = (key: TabKey) => {
        setActiveTab(key);
        fetchTab(key);
    };

    const currentTab = TABS.find(t => t.key === activeTab)!;
    const entries = data[activeTab];
    const isLoading = loading[activeTab];

    return (
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-6 pt-6 pb-0">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                            <TrendingUp size={15} className="text-white" />
                        </div>
                        <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Ranking</h3>
                    </div>
                    <Link
                        href="/ranking"
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        Ver tudo <ExternalLink size={11} />
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl mb-5">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.key === activeTab;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={cn(
                                    "relative flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-black transition-all duration-200",
                                    isActive
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Icon size={12} />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            <div className="px-4 pb-5 min-h-[180px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                    >
                        {isLoading ? (
                            <div className="space-y-2 pt-1">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
                                        <Skeleton className="w-9 h-9 rounded-2xl shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-3 w-28" />
                                            <Skeleton className="h-2 w-16" />
                                        </div>
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                ))}
                            </div>
                        ) : !entries || entries.length === 0 ? (
                            <EmptyState tab={currentTab} />
                        ) : (
                            <div className="space-y-1.5 pt-1">
                                {entries.slice(0, 3).map((entry, i) => (
                                    <RankRow
                                        key={entry.id}
                                        entry={entry}
                                        index={i}
                                        tab={currentTab}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

function RankRow({ entry, index, tab }: { entry: RankEntry; index: number; tab: Tab }) {
    const medal = MEDAL_CONFIG[index];
    const MedalIcon = medal.Icon;

    const formattedValue =
        tab.key === "semanal"
            ? `${entry.value.toLocaleString("pt-BR")} XP`
            : tab.key === "simulados"
                ? `${entry.value} pts`
                : `${entry.value} vic.`;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.22 }}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
        >
            {/* Medal */}
            <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110",
                medal.bg, medal.border
            )}>
                <MedalIcon size={14} className={medal.text} />
            </div>

            {/* Avatar */}
            <div className={cn("rounded-2xl overflow-hidden shrink-0 ring-2", medal.ring)}>
                <Avatar
                    src={entry.avatar && entry.avatar.length > 3 ? entry.avatar : undefined}
                    name={entry.name}
                    size="sm"
                    rankLevel={entry.level}
                />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-800 truncate leading-tight">
                    {entry.nickname || entry.name.split(" ")[0]}
                </div>
                {entry.nickname && (
                    <div className="text-[10px] text-slate-400 font-medium truncate">{entry.name.split(" ")[0]}</div>
                )}
            </div>

            {/* Value */}
            <div className={cn("text-[12px] font-black shrink-0 tabular-nums", tab.accent)}>
                {formattedValue}
            </div>
        </motion.div>
    );
}

function EmptyState({ tab }: { tab: Tab }) {
    const Icon = tab.icon;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
        >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br opacity-20",
                tab.color
            )}>
                <Icon size={20} className="text-white opacity-100" />
            </div>
            <div className="text-center">
                <p className="text-[12px] font-bold text-slate-400">{tab.emptyMsg}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">Seja o primeiro a pontuar!</p>
            </div>
        </motion.div>
    );
}
