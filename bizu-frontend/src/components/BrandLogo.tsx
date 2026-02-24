import Link from "next/link";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl" | "hero";
    variant?: "dark" | "light" | "gradient";
    link?: boolean;
}

const sizes = {
    sm: { bizu: "text-[32px]", tag: "text-[10px]", gap: "gap-2", pl: "pl-2.5", border: "border-l-2", py: "py-1" },
    md: { bizu: "text-[48px]", tag: "text-[12px]", gap: "gap-3", pl: "pl-3.5", border: "border-l-2", py: "py-1.5" },
    lg: { bizu: "text-[72px]", tag: "text-[15px]", gap: "gap-4", pl: "pl-4", border: "border-l-[3px]", py: "py-2" },
    xl: { bizu: "text-[100px]", tag: "text-[18px]", gap: "gap-5", pl: "pl-5", border: "border-l-[4px]", py: "py-3" },
    hero: { bizu: "text-[120px] sm:text-[140px] md:text-[180px]", tag: "text-[20px] sm:text-[22px] md:text-[28px]", gap: "gap-8", pl: "pl-8", border: "border-l-[6px]", py: "py-5" },
};

const variants = {
    dark: {
        bizu: "text-slate-950",
        tag: "text-slate-500",
        tagBorder: "border-slate-300",
        glow: ""
    },
    light: {
        bizu: "text-white",
        tag: "text-white/80",
        tagBorder: "border-white/30",
        glow: "drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
    },
    gradient: {
        bizu: "bg-clip-text text-transparent bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400",
        tag: "text-indigo-400 font-black",
        tagBorder: "border-indigo-300/40",
        glow: "drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]"
    },
};

export default function BrandLogo({ size = "md", variant = "dark", link = true }: BrandLogoProps) {
    const s = sizes[size];
    const v = variants[variant];

    const content = (
        <span className={`inline-flex items-center ${s.gap} select-none overflow-visible group`}>
            <span
                className={`
                    ${s.py} pr-[0.1em] -mr-[0.1em] overflow-visible 
                    ${s.bizu} font-black italic
                    ${variant === "gradient" ? v.bizu : v.bizu}
                    ${v.glow}
                    transition-all duration-700 
                    group-hover:scale-[1.08] group-hover:-rotate-2 group-hover:brightness-110
                    cursor-default
                `}
                style={{
                    fontFamily: "Bobaland, sans-serif",
                    lineHeight: 0.85,
                    filter: variant === "light" ? "drop-shadow(0 15px 30px rgba(0,0,0,0.3))" : undefined,
                    textShadow: variant === "light" ? "0 0 60px rgba(255,255,255,0.3)" : undefined
                }}
            >
                Bizu!
            </span>
            <div className="flex flex-col justify-center">
                <span
                    className={`
                        ${s.tag} font-black tracking-[0.5em] uppercase 
                        ${s.border} ${s.pl} ${v.tag} ${v.tagBorder}
                        transition-all duration-700 
                        group-hover:tracking-[0.8em] group-hover:translate-x-2
                        select-none
                    `}
                    style={{ lineHeight: 1 }}
                >
                    Academy
                </span>
            </div>
        </span>
    );

    if (link) {
        return (
            <Link href="/" className="inline-flex hover:opacity-100 transition-opacity overflow-visible">
                {content}
            </Link>
        );
    }

    return content;
}
