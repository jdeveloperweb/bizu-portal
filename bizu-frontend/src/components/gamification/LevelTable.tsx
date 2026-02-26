"use client";

import React from "react";
import { Zap, Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelRequirement {
    level: number;
    requiredXp: number;
}

interface LevelTableProps {
    levels: LevelRequirement[];
    currentLevel: number;
    currentXp: number;
}

export default function LevelTable({ levels, currentLevel, currentXp }: LevelTableProps) {
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
                            <th className="px-6 py-3">Nível</th>
                            <th className="px-6 py-3">XP Necessário</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {levels.map((lvl) => {
                            const isReached = currentLevel >= lvl.level;
                            const isNext = currentLevel + 1 === lvl.level;

                            return (
                                <tr
                                    key={lvl.level}
                                    className={cn(
                                        "transition-colors",
                                        isReached ? "bg-amber-50/30" : "hover:bg-slate-50/50",
                                        isNext && "bg-indigo-50/30"
                                    )}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm border",
                                                isReached
                                                    ? "bg-amber-500 text-white border-amber-400"
                                                    : "bg-white text-slate-400 border-slate-200"
                                            )}>
                                                {lvl.level}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                isReached ? "text-amber-700" : "text-slate-600"
                                            )}>
                                                {lvl.requiredXp.toLocaleString('pt-BR')} XP
                                            </span>
                                            {isNext && (
                                                <span className="text-[10px] text-indigo-600 font-bold">Faltam {(lvl.requiredXp - currentXp).toLocaleString('pt-BR')} XP</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
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
