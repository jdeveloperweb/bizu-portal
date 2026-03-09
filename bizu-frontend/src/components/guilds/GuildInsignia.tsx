"use client";

import { GUILD_BADGES, GuildBadgeType, BadgeSVGs } from "./GuildBadge";

interface GuildInsigniaProps {
    badge: string | null | undefined;
    guildName: string | null | undefined;
    size?: number;
}

export function GuildInsignia({ badge, guildName, size = 18 }: GuildInsigniaProps) {
    if (!badge || !guildName) return null;

    const config = GUILD_BADGES.find(b => b.id === badge);
    if (!config) return null;

    const SVGIcon = BadgeSVGs[badge as GuildBadgeType];
    if (!SVGIcon) return null;

    const iconSize = Math.round(size * 0.56);

    return (
        <span className="relative inline-flex items-center group/guild flex-shrink-0">
            <span
                className={`relative flex items-center justify-center rounded-[4px] bg-gradient-to-br ${config.gradient} overflow-hidden flex-shrink-0`}
                style={{ width: size, height: size }}
            >
                <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <SVGIcon size={iconSize} />
            </span>
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-semibold rounded-md whitespace-nowrap invisible group-hover/guild:visible opacity-0 group-hover/guild:opacity-100 transition-all pointer-events-none z-50 shadow-lg">
                {guildName}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900" />
            </span>
        </span>
    );
}
