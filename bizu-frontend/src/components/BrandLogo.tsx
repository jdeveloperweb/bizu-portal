import Link from "next/link";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl" | "hero";
    variant?: "dark" | "light" | "gradient";
    link?: boolean;
}

const sizes = {
    sm: { bizu: "text-[24px]", tag: "text-[8px]", gap: "gap-1.5", pl: "pl-1.5", border: "border-l" },
    md: { bizu: "text-[32px]", tag: "text-[9px]", gap: "gap-2", pl: "pl-2", border: "border-l" },
    lg: { bizu: "text-[44px]", tag: "text-[11px]", gap: "gap-2.5", pl: "pl-2.5", border: "border-l-2" },
    xl: { bizu: "text-[56px]", tag: "text-[13px]", gap: "gap-3", pl: "pl-3", border: "border-l-2" },
    hero: { bizu: "text-[72px]", tag: "text-[15px]", gap: "gap-3.5", pl: "pl-3.5", border: "border-l-2" },
};

const variants = {
    dark: { bizu: "text-slate-900", tag: "text-slate-400", tagBorder: "border-slate-200" },
    light: { bizu: "text-white", tag: "text-white/60", tagBorder: "border-white/20" },
    gradient: { bizu: "", tag: "text-indigo-400", tagBorder: "border-indigo-200" },
};

export default function BrandLogo({ size = "md", variant = "dark", link = true }: BrandLogoProps) {
    const s = sizes[size];
    const v = variants[variant];

    const content = (
        <span className={`inline-flex items-center ${s.gap} select-none`}>
            <span
                className={`leading-none font-normal ${s.bizu} ${variant === "gradient" ? "" : v.bizu}`}
                style={{
                    fontFamily: "Bobaland, sans-serif",
                    ...(variant === "gradient"
                        ? {
                            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
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
                className={`${s.tag} font-extrabold tracking-[0.25em] uppercase mt-1 ${s.border} ${s.pl} ${v.tag} ${v.tagBorder}`}
            >
                Academy
            </span>
        </span>
    );

    if (link) {
        return (
            <Link href="/" className="inline-flex hover:opacity-80 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}
