"use client";

import { cn } from "@/lib/utils";

interface RankInsigniaProps {
    level: number;
    rank?: string;
    className?: string;
    showName?: boolean;
    size?: "xxs" | "xs" | "sm" | "md" | "lg";
}

// Custom SVG Insignia Components
const InsigniaSVG = ({ level, size = 24 }: { level: number, size?: number }) => {
    const viewBox = "0 0 100 100";

    // Praças (Soldier/Corporal/Sergeant) - Chevrons
    if (level <= 25) {
        let stripes = 0;
        let color = "#94a3b8"; // Slate 400

        if (level <= 2) stripes = 0; // Recruta
        else if (level <= 6) { stripes = 1; color = "#64748b"; } // Soldado
        else if (level <= 10) { stripes = 2; color = "#475569"; } // Cabo
        else if (level <= 15) { stripes = 3; color = "#b45309"; } // 3º Sargento (Brown/Gold)
        else if (level <= 20) { stripes = 4; color = "#92400e"; } // 2º Sargento
        else { stripes = 5; color = "#78350f"; } // 1º Sargento

        // Center chevrons vertically: total span = 20 + (stripes-1)*15, top_y = (95 - 15*stripes) / 2
        const topY = stripes > 0 ? (95 - 15 * stripes) / 2 : 0;

        return (
            <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                {stripes === 0 && <circle cx="50" cy="50" r="20" stroke={color} strokeWidth="8" />}
                {[...Array(stripes)].map((_, i) => (
                    <path key={i} d={`M20 ${topY + i * 15} L50 ${topY + 20 + i * 15} L80 ${topY + i * 15}`}
                        stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                ))}
            </svg>
        );
    }

    // Subtenente - Lozenge/Diamond
    if (level <= 30) {
        return (
            <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="#3b82f6" stroke="#1e40af" strokeWidth="4" />
                <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="white" opacity="0.5" />
            </svg>
        );
    }

    // Oficiais (Tenentes/Capitão) - Stars
    if (level <= 52) {
        let stars = 1;
        let color = "#10b981"; // Emerald
        if (level <= 35) { stars = 1; color = "#34d399"; } // Aspirante
        else if (level <= 40) { stars = 1; color = "#10b981"; } // 2º Tenente
        else if (level <= 45) { stars = 2; color = "#059669"; } // 1º Tenente
        else { stars = 3; color = "#047857"; } // Capitão

        const starPath = "M50 15 L58 38 L82 38 L63 52 L70 75 L50 61 L30 75 L37 52 L18 38 L42 38 Z";

        return (
            <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                {stars >= 1 && <path d={starPath} fill={color} transform={stars === 1 ? "scale(1) translate(0,0)" : "scale(0.6) translate(35, 10)"} />}
                {stars >= 2 && <path d={starPath} fill={color} transform="scale(0.6) translate(35, 75)" />}
                {stars >= 3 && <path d={starPath} fill={color} transform="scale(0.6) translate(-30, 42)" />}
            </svg>
        );
    }

    // Oficiais Superiores (Major to Coronel) - Stars with Shield
    if (level <= 80) {
        let color = "#8b5cf6"; // Violet
        let fill = "#ede9fe";
        if (level <= 60) color = "#8b5cf6"; // Major
        else if (level <= 70) color = "#7c3aed"; // Tenente-Coronel
        else color = "#6d28d9"; // Coronel

        return (
            <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="15" width="70" height="70" rx="15" fill={fill} stroke={color} strokeWidth="8" />
                <path d="M50 30 L55 45 L70 45 L58 55 L63 70 L50 60 L37 70 L42 55 L30 45 L45 45 Z" fill={color} />
            </svg>
        );
    }

    // Generais to Marechal - Golden Items
    let color = "#eab308"; // Gold
    let bg = "#1e293b"; // Slate 800
    if (level > 95) color = "#f97316"; // Marechal (Orange/Fire)

    return (
        <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill={bg} stroke={color} strokeWidth="4" />
            <path d="M50 20 L55 40 L75 40 L60 52 L65 72 L50 60 L35 72 L40 52 L25 40 L45 40 Z" fill={color} />
            <circle cx="50" cy="50" r="30" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
        </svg>
    );
};

export function RankInsignia({ level, rank, className, showName = false, size = "md" }: RankInsigniaProps) {
    const sizeMap = {
        xxs: { container: "w-4 h-4 p-px", icon: 10 },
        xs: { container: "w-5 h-5 p-0.5", icon: 12 },
        sm: { container: "w-8 h-8 p-1", icon: 20 },
        md: { container: "w-12 h-12 p-2", icon: 32 },
        lg: { container: "w-20 h-20 p-3.5", icon: 56 }
    };

    const currentSize = sizeMap[size];

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className={cn(
                "rounded-full flex items-center justify-center transition-all duration-500 bg-white border border-slate-100 shadow-sm",
                currentSize.container
            )}>
                <InsigniaSVG level={level} size={currentSize.icon} />
            </div>
            {showName && (
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        Patente Militar
                    </span>
                    <span className="text-sm font-black text-slate-900 leading-none">
                        {rank || "Recruta"}
                    </span>
                </div>
            )}
        </div>
    );
}
