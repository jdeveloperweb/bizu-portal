import PageHeader from "@/components/PageHeader";
import BadgeCard from "@/components/gamification/BadgeCard";
import { Star, Trophy, Sparkles } from "lucide-react";

export default function AchievementsPage() {
    const categories = [
        {
            title: "Consistência",
            badges: [
                { name: "Madrugador", description: "Resolveu questões antes das 6h da manhã.", icon: "sunrise", earned: true },
                { name: "Fogo Amigo", description: "Manteve uma ofensiva de 7 dias.", icon: "flame", earned: true },
                { name: "Maratonista", description: "Estudou por mais de 4 horas seguidas.", icon: "flame", earned: false },
            ]
        },
        {
            title: "Performance",
            badges: [
                { name: "Centenário", description: "Resolveu 100 questões com aproveitamento > 80%.", icon: "target", earned: true },
                { name: "Sniper", description: "Acertou 10 questões seguidas de nível difícil.", icon: "target", earned: false },
                { name: "Primeiro Passo", description: "Concluiu seu primeiro simulado completo.", icon: "play", earned: true },
            ]
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-12 mb-16">
                <div className="flex-1">
                    <PageHeader
                        title="Minhas Conquistas"
                        description="Cada selo representa um degrau na sua jornada rumo à aprovação."
                        badge="GAMIFICAÇÃO"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="p-8 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex flex-col items-center justify-center min-w-[200px]">
                        <Star className="w-8 h-8 mb-4 fill-primary-foreground/20" />
                        <div className="text-3xl font-black">12.500</div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">XP Total</div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-accent text-accent-foreground shadow-2xl shadow-accent/30 flex flex-col items-center justify-center min-w-[200px]">
                        <Trophy className="w-8 h-8 mb-4 fill-accent-foreground/20" />
                        <div className="text-3xl font-black">Lv. 14</div>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80">Nível Atual</div>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                {categories.map((cat) => (
                    <section key={cat.title}>
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-primary" />
                            {cat.title}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cat.badges.map((badge) => (
                                <BadgeCard
                                    key={badge.name}
                                    name={badge.name}
                                    description={badge.description}
                                    icon={badge.icon as any}
                                    earned={badge.earned}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
