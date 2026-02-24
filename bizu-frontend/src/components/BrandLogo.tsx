import Link from "next/link";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl" | "hero";
    variant?: "dark" | "light" | "gradient";
    link?: boolean;
}

const sizes = {
    sm: { bizu: "text-[32px]", tag: "text-[12px]", gap: "gap-2", pl: "pl-2.5", border: "border-l-2", py: "py-1" },
    md: { bizu: "text-[42px]", tag: "text-[14px]", gap: "gap-2.5", pl: "pl-3", border: "border-l-2", py: "py-1.5" },
    lg: { bizu: "text-[56px]", tag: "text-[16px]", gap: "gap-3", pl: "pl-3.5", border: "border-l-[3px]", py: "py-2" },
    xl: { bizu: "text-[76px]", tag: "text-[18px]", gap: "gap-3.5", pl: "pl-4", border: "border-l-[3px]", py: "py-2" },
    hero: { bizu: "text-[90px] sm:text-[110px] md:text-[130px]", tag: "text-[18px] sm:text-[22px] md:text-[26px]", gap: "gap-4", pl: "pl-5", border: "border-l-[4px]", py: "py-3" },
};

const variants = {
    dark: { bizu: "text-slate-900", tag: "text-slate-400", tagBorder: "border-slate-300" },
    light: { bizu: "text-white", tag: "text-white/70", tagBorder: "border-white/30" },
    gradient: { bizu: "", tag: "text-indigo-400", tagBorder: "border-indigo-300" },
};

export default function BrandLogo({ size = "md", variant = "dark", link = true }: BrandLogoProps) {
    const s = sizes[size];
    const v = variants[variant];

    const content = (
        <span className={`inline-flex items-center ${s.gap} select-none overflow-visible`}>
            <span
                className={`${s.py} pr-[0.15em] -mr-[0.15em] overflow-visible ${s.bizu} ${variant === "gradient" ? "" : v.bizu}`}
                style={{
                    fontFamily: "Bobaland, sans-serif",
                    lineHeight: 1.1,
                    ...(variant === "gradient"
                        ? {
                            background: "linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }
                        : {}),
                }}
            >
                Bizu!
            </span>
            <span
                className={`${s.tag} font-extrabold tracking-[0.3em] uppercase ${s.border} ${s.pl} ${v.tag} ${v.tagBorder}`}
                style={{ lineHeight: 1 }}
            >
                Academy
            </span>
        </span>
    );

    if (link) {
        return (
            <Link href="/" className="inline-flex hover:opacity-80 transition-opacity overflow-visible">
                {content}
            </Link>
        );
    }

    return content;
}
