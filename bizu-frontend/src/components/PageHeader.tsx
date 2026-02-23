interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
    return (
        <div className="mb-12">
            {badge && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                    {badge}
                </div>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">{title}</h1>
            {description && (
                <p className="text-muted-foreground text-lg">{description}</p>
            )}
        </div>
    );
}
