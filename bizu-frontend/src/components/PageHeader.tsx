interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
    return (
        <div>
            {badge && (
                <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em] mb-3 inline-flex">
                    {badge}
                </span>
            )}
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">{title}</h1>
            {description && (
                <p className="text-sm text-slate-500">{description}</p>
            )}
        </div>
    );
}
