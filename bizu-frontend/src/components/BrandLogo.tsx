import Link from "next/link";

interface BrandLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "dark" | "light" | "gradient";
    link?: boolean;
}

const sizes = {
    sm: { bizu: "text-[20px]", tag: "text-[7px]", gap: "gap-1" },
    md: { bizu: "text-[26px]", tag: "text-[8px]", gap: "gap-1.5" },
    lg: { bizu: "text-[34px]", tag: "text-[9px]", gap: "gap-1.5" },
    xl: { bizu: "text-[48px]", tag: "text-[11px]", gap: "gap-2" },
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
                className={`${s.tag} font-extrabold tracking-[0.25em] uppercase mt-0.5 border-l pl-1.5 ${v.tag} ${v.tagBorder}`}
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
