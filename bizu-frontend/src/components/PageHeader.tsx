interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
    return (
        <div>
            {badge && (
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-3 border"
                    style={{
                        background: "rgba(99,102,241,0.1)",
                        borderColor: "rgba(99,102,241,0.2)",
                        color: "#A5B4FC",
                    }}
                >
                    {badge}
                </span>
            )}
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">{title}</h1>
            {description && (
                <p className="text-sm text-slate-500">{description}</p>
            )}
        </div>
    );
}
