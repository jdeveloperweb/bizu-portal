import { LucideIcon, Award, Flame, Sun, Target } from "lucide-react";

interface BadgeCardProps {
    name: string;
    description: string;
    icon: "sunrise" | "flame" | "target" | "play";
    earned?: boolean;
}

const icons = {
    sunrise: Sun,
    flame: Flame,
    target: Target,
    play: Award,
};

export default function BadgeCard({ name, description, icon, earned = false }: BadgeCardProps) {
    const Icon = icons[icon] || Award;

    return (
        <div className={`p-6 rounded-[32px] border transition-all duration-500 ${earned ? "bg-card border-primary/20 shadow-lg" : "bg-muted/10 border-dashed opacity-50 grayscale"
            }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${earned ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                <Icon className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-lg mb-2">{name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
            </p>

            {!earned && (
                <div className="mt-4 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-muted rounded-full">
                        <div className="h-full bg-primary/30 w-1/2 rounded-full" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Bloqueado</span>
                </div>
            )}
        </div>
    );
}
