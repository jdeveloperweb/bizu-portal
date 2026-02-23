import PageHeader from "@/components/PageHeader";
import { Trophy, Medal, Star } from "lucide-react";

export default function RankingPage() {
    const topUsers = [
        { name: "Jaime Vicente", xp: 12500, streak: 15, rank: 1, avatar: "JV" },
        { name: "Ana Silva", xp: 11200, streak: 42, rank: 2, avatar: "AS" },
        { name: "Carlos Oliveira", xp: 10800, streak: 7, rank: 3, avatar: "CO" },
        { name: "Mariana Costa", xp: 9500, streak: 21, rank: 4, avatar: "MC" },
        { name: "Ricardo Santos", xp: 8700, streak: 12, rank: 5, avatar: "RS" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <PageHeader
                title="Ranking Global"
                description="Acompanhe os alunos mais dedicados da plataforma e suba de nível."
                badge="COMPETIÇÃO"
            />

            <div className="grid grid-cols-1 gap-4">
                {topUsers.map((user) => (
                    <div
                        key={user.rank}
                        className={`flex items-center gap-6 p-6 rounded-[32px] border transition-all hover:shadow-lg ${user.rank <= 3 ? "bg-primary/5 border-primary/20" : "bg-card"
                            }`}
                    >
                        <div className={`w-12 h-12 flex items-center justify-center font-black text-xl rounded-2xl ${user.rank === 1 ? "bg-accent text-accent-foreground" :
                                user.rank === 2 ? "bg-slate-300 text-slate-700" :
                                    user.rank === 3 ? "bg-orange-300 text-orange-800" :
                                        "bg-muted text-muted-foreground"
                            }`}>
                            {user.rank}
                        </div>

                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border-2 border-primary/20">
                            {user.avatar}
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-accent fill-accent" />
                                    {user.xp.toLocaleString()} XP
                                </span>
                                <span className="flex items-center gap-1">
                                    <Trophy className="w-3 h-3 text-primary" />
                                    {user.streak} dias de ofensiva
                                </span>
                            </div>
                        </div>

                        {user.rank <= 3 && (
                            <Medal className={`w-8 h-8 ${user.rank === 1 ? "text-accent" :
                                    user.rank === 2 ? "text-slate-400" :
                                        "text-orange-400"
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-[40px] bg-muted/30 border border-dashed text-center">
                <p className="text-sm text-muted-foreground font-medium">
                    O ranking é atualizado a cada 1 hora. Continue estudando para subir de posição!
                </p>
            </div>
        </div>
    );
}
