"use client";

export type GuildBadgeType =
  | "espada"
  | "escudo"
  | "coroa"
  | "chama"
  | "cristal"
  | "trovao"
  | "dragao"
  | "olho"
  | "ancora"
  | "leao"
  | "fenix"
  | "infinito";

export interface GuildBadgeConfig {
  id: GuildBadgeType;
  name: string;
  description: string;
  gradient: string;
  glow: string;
  border: string;
}

export const GUILD_BADGES: GuildBadgeConfig[] = [
  {
    id: "espada",
    name: "Dourada",
    description: "Para guerreiros do conhecimento",
    gradient: "from-yellow-600 via-amber-500 to-yellow-400",
    glow: "rgba(245,158,11,0.6)",
    border: "#F59E0B",
  },
  {
    id: "escudo",
    name: "Ferro",
    description: "Defensores da verdade",
    gradient: "from-slate-600 via-blue-500 to-slate-400",
    glow: "rgba(100,149,237,0.6)",
    border: "#6495ED",
  },
  {
    id: "coroa",
    name: "Real",
    description: "A elite do saber",
    gradient: "from-purple-700 via-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.6)",
    border: "#8B5CF6",
  },
  {
    id: "chama",
    name: "Eterna",
    description: "Paixão que nunca se apaga",
    gradient: "from-red-700 via-orange-500 to-red-400",
    glow: "rgba(249,115,22,0.6)",
    border: "#F97316",
  },
  {
    id: "cristal",
    name: "Arcano",
    description: "Mestres do arcano",
    gradient: "from-cyan-700 via-sky-400 to-cyan-300",
    glow: "rgba(34,211,238,0.6)",
    border: "#22D3EE",
  },
  {
    id: "trovao",
    name: "Trovão",
    description: "Velocidade e poder",
    gradient: "from-yellow-400 via-yellow-300 to-white",
    glow: "rgba(234,179,8,0.7)",
    border: "#EAB308",
  },
  {
    id: "dragao",
    name: "Dragão",
    description: "Força ancestral",
    gradient: "from-green-700 via-emerald-500 to-green-400",
    glow: "rgba(16,185,129,0.6)",
    border: "#10B981",
  },
  {
    id: "olho",
    name: "Místico",
    description: "Visão além do ordinário",
    gradient: "from-violet-800 via-purple-500 to-fuchsia-400",
    glow: "rgba(168,85,247,0.6)",
    border: "#A855F7",
  },
  {
    id: "ancora",
    name: "Âncora",
    description: "Firmes nos fundamentos",
    gradient: "from-blue-900 via-blue-700 to-blue-500",
    glow: "rgba(37,99,235,0.6)",
    border: "#2563EB",
  },
  {
    id: "leao",
    name: "Leão",
    description: "Líderes natos",
    gradient: "from-amber-700 via-amber-500 to-yellow-400",
    glow: "rgba(217,119,6,0.6)",
    border: "#D97706",
  },
  {
    id: "fenix",
    name: "Fênix",
    description: "Renascem mais fortes",
    gradient: "from-red-600 via-orange-400 to-yellow-300",
    glow: "rgba(239,68,68,0.6)",
    border: "#EF4444",
  },
  {
    id: "infinito",
    name: "Infinito",
    description: "Sem limites para aprender",
    gradient: "from-indigo-700 via-indigo-500 to-blue-400",
    glow: "rgba(99,102,241,0.6)",
    border: "#6366F1",
  },
];

export const BadgeSVGs: Record<GuildBadgeType, React.FC<{ size?: number }>> = {
  espada: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 24L16 4L24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 18H21.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 24H18" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="28" r="1.5" fill="white" />
    </svg>
  ),
  escudo: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L28 9V18C28 23.5 22.6 27.8 16 30C9.4 27.8 4 23.5 4 18V9L16 4Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M11 16L14.5 19.5L21 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  coroa: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 22L7 10L14 17L16 8L18 17L25 10L28 22H4Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 25H28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="8" r="1.5" fill="white" />
      <circle cx="7" cy="10" r="1.5" fill="white" />
      <circle cx="25" cy="10" r="1.5" fill="white" />
    </svg>
  ),
  chama: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4C16 4 22 10 22 16C22 20 20 22 18 23C20 19 17 16 17 16C17 16 18 21 14 24C12 25.5 10 24 10 21C10 17 14 13 14 13C14 13 12 18 14 20C15 17 13 12 16 4Z" fill="white" opacity="0.9" />
      <path d="M14 24C14 24 10 26 10 28H22C22 26 19 24 18 23C17.5 25 16 26 14 24Z" fill="white" opacity="0.7" />
    </svg>
  ),
  cristal: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 4L22 12L16 28L10 12L16 4Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 12H22" stroke="white" strokeWidth="1.5" />
      <path d="M12 8L16 4L20 8" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="4" r="2" fill="white" opacity="0.8" />
    </svg>
  ),
  trovao: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M18 4L8 18H16L14 28L24 14H16L18 4Z" fill="white" />
    </svg>
  ),
  dragao: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M8 24C8 24 6 18 8 14C10 10 14 9 14 9C14 9 11 12 12 15C13 11 16 8 20 8C22 8 24 10 24 12C24 14 22 14 22 14C22 14 24 16 22 19C20 22 16 22 14 21C12 22 10 24 8 24Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 12C25 10 27 8 27 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="11" r="1" fill="white" />
      <path d="M8 24L5 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  olho: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M4 16C4 16 9 8 16 8C23 8 28 16 28 16C28 16 23 24 16 24C9 24 4 16 4 16Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="4" stroke="white" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.5" fill="white" />
      <path d="M16 8V6M16 26V24M4 16H2M30 16H28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ancora: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="9" r="3" stroke="white" strokeWidth="2" />
      <path d="M16 12V26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 26C10 26 8 24 8 22C8 20 9.5 19 11 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 26C22 26 24 24 24 22C24 20 22.5 19 21 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 26H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 9H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  leao: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="15" r="6" stroke="white" strokeWidth="2" />
      <circle cx="16" cy="15" r="9" stroke="white" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M14 17C14 17 15 19 16 19C17 19 18 17 18 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="14" r="1" fill="white" />
      <circle cx="18" cy="14" r="1" fill="white" />
      <path d="M13 12C13 12 12 10 10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 12C19 12 20 10 22 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 21V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 26L16 23L20 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  fenix: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 26C16 26 8 22 8 14C8 10 11 7 14 8C12 10 12 13 14 14C13 10 16 6 16 6C16 6 19 10 18 14C20 13 20 10 18 8C21 7 24 10 24 14C24 22 16 26 16 26Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 22C10 24 8 28 8 28H24C24 28 22 24 20 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  infinito: ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M6 16C6 13.8 7.8 12 10 12C12.2 12 13.5 13.5 16 16C18.5 18.5 19.8 20 22 20C24.2 20 26 18.2 26 16C26 13.8 24.2 12 22 12C19.8 12 18.5 13.5 16 16C13.5 18.5 12.2 20 10 20C7.8 20 6 18.2 6 16Z" stroke="white" strokeWidth="2.5" />
    </svg>
  ),
};

interface GuildBadgeProps {
  type: GuildBadgeType;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  sm: { container: 40, icon: 20 },
  md: { container: 56, icon: 28 },
  lg: { container: 80, icon: 40 },
  xl: { container: 112, icon: 56 },
};

export function GuildBadge({
  type,
  size = "md",
  showGlow = false,
  selected = false,
  onClick,
  className = "",
}: GuildBadgeProps) {
  const config = GUILD_BADGES.find((b) => b.id === type)!;
  const IconSVG = BadgeSVGs[type];
  const { container, icon } = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} cursor-pointer transition-all duration-300 ${selected ? "scale-110 border-2" : "hover:scale-105"
        } ${className}`}
      style={{
        width: container,
        height: container,
        boxShadow: showGlow || selected
          ? `0 0 20px ${config.glow}, 0 0 40px ${config.glow}40`
          : undefined,
        borderColor: selected ? config.border : undefined,
      }}
    >
      {/* Inner shine */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />
      {/* Icon */}
      <IconSVG size={icon} />
      {/* Selected ring */}
      {selected && (
        <div
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: config.border }}
        />
      )}
    </div>
  );
}

export function GuildBadgeSelector({
  value,
  onChange,
}: {
  value: GuildBadgeType;
  onChange: (type: GuildBadgeType) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {GUILD_BADGES.map((badge) => (
        <div key={badge.id} className="flex flex-col items-center gap-1.5">
          <GuildBadge
            type={badge.id}
            size="md"
            selected={value === badge.id}
            showGlow={value === badge.id}
            onClick={() => onChange(badge.id)}
          />
          <span className="text-[10px] text-slate-400 text-center leading-tight">
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  );
}
