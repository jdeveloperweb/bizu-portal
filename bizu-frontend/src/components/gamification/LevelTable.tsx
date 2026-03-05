"use client";

import { Zap, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { RankInsignia } from "./RankInsignia";

interface LevelRequirement {
    level: number;
    requiredXp: number;
    rank: string;
}

interface LevelTableProps {
    levels: LevelRequirement[];
    currentLevel: number;
    currentXp: number;
}

function getLevelRank(level: number): string {
    if (level <= 2) return "Recruta";
    if (level <= 6) return "Soldado";
    if (level <= 10) return "Cabo";
    if (level <= 15) return "3º Sargento";
    if (level <= 20) return "2º Sargento";
    if (level <= 25) return "1º Sargento";
    if (level <= 30) return "Subtenente";
    if (level <= 35) return "Aspirante";
    if (level <= 40) return "2º Tenente";
    if (level <= 45) return "1º Tenente";
    if (level <= 52) return "Capitão";
    if (level <= 60) return "Major";
    if (level <= 70) return "Tenente-Coronel";
    if (level <= 80) return "Coronel";
    if (level <= 95) return "General";
    return "Marechal";
}

function estimateXp(level: number): number {
    // Quadratic formula derived from observed progression (valid for mid-high levels)
    return Math.round(55 * level * level + 5003 * level - 44649);
}

function buildFullLevelTable(apiLevels: LevelRequirement[]): LevelRequirement[] {
    const MAX_LEVEL = 100;
    const apiMap = new Map(apiLevels.map(l => [l.level, l]));
    const result: LevelRequirement[] = [];

    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
        if (apiMap.has(lvl)) {
            result.push(apiMap.get(lvl)!);
        } else {
            result.push({
                level: lvl,
                requiredXp: Math.max(0, estimateXp(lvl)),
                rank: getLevelRank(lvl),
            });
        }
    }

    return result;
}

export default function LevelTable({ levels, currentLevel, currentXp }: LevelTableProps) {
    const allLevels = buildFullLevelTable(levels);

    return (
        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-border bg-slate-50/50">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Zap size={18} className="text-amber-500 fill-amber-500" />
                    Tabela de Níveis
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium italic">
                    Acumule XP para subir de nível e desbloquear novas conquistas.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-5 py-3">Nível</th>
                            <th className="px-5 py-3">Promoção</th>
                            <th className="px-5 py-3">XP Necessário</th>
                            <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {allLevels.map((lvl, index) => {
                            const isReached = currentLevel >= lvl.level;
                            const isNext = currentLevel + 1 === lvl.level;
                            const prevRank = index > 0 ? allLevels[index - 1].rank : null;
                            const isPromotion = lvl.rank !== prevRank;

                            return (
                                <tr
                                    key={lvl.level}
                                    className={cn(
                                        "transition-colors",
                                        isReached ? "bg-amber-50/30" : "hover:bg-slate-50/50",
                                        isNext && "bg-indigo-50/30"
                                    )}
                                >
                                    <td className="px-5 py-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm border",
                                            isReached
                                                ? "bg-amber-500 text-white border-amber-400"
                                                : "bg-white text-slate-400 border-slate-200"
                                        )}>
                                            {lvl.level}
                                        </div>
                                    </td>

                                    <td className="px-5 py-3">
                                        {isPromotion ? (
                                            <div className="flex items-center gap-2">
                                                <RankInsignia level={lvl.level} size="sm" />
                                                <div className="flex flex-col">
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5",
                                                        isReached ? "text-amber-600" : "text-indigo-400"
                                                    )}>
                                                        <ArrowUp size={9} /> UP
                                                    </span>
                                                    <span className={cn(
                                                        "text-xs font-bold leading-none",
                                                        isReached ? "text-slate-900" : "text-slate-500"
                                                    )}>
                                                        {lvl.rank}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 text-[11px] pl-1">—</span>
                                        )}
                                    </td>

                                    <td className="px-5 py-3">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                isReached ? "text-amber-700" : "text-slate-600"
                                            )}>
                                                {lvl.requiredXp.toLocaleString('pt-BR')} XP
                                            </span>
                                            {isNext && (
                                                <span className="text-[10px] text-indigo-600 font-bold">
                                                    Faltam {(lvl.requiredXp - currentXp).toLocaleString('pt-BR')} XP
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 text-right">
                                        {isReached ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                                                Concluído
                                            </div>
                                        ) : isNext ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase animate-pulse">
                                                Próximo
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase">
                                                Bloqueado
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-border">
                <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-500 uppercase tracking-wider">Progresso Atual</span>
                    <span className="text-indigo-600">{currentXp.toLocaleString('pt-BR')} Total XP</span>
                </div>
            </div>
        </div>
    );
}
