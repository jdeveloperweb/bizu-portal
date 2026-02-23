"use client";

import PageHeader from "../../../components/PageHeader";
import {
    Swords,
    Users,
    Trophy,
    Zap,
    Timer,
    CheckCircle2,
    ChevronRight,
    Target
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useState } from "react";

export default function ArenaPage() {
    const [activeTab, setActiveTab] = useState<'online' | 'ranking'>('online');
    const [pendingDuels, setPendingDuels] = useState([
        { id: "d1", challenger: "Maria Silva", subject: "Direito Administrativo", time: "Há 1 min" }
    ]);

    const onlineUsers = [
        { id: "1", name: "Jaime Vicente", level: 12, xp: 8500, avatar: "JV" },
        { id: "2", name: "Maria Silva", level: 15, xp: 12000, avatar: "MS" },
        { id: "3", name: "Ricardo Oliveira", level: 10, xp: 6200, avatar: "RO" },
    ];

    const ranking = [
        { pos: 1, name: "Maria Silva", wins: 45, ratio: "82%" },
        { pos: 2, name: "Jaime Vicente", wins: 38, ratio: "75%" },
        { pos: 3, name: "Ricardo Oliveira", wins: 30, ratio: "68%" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <PageHeader
                title="Arena de Duelos"
                description="Desafie outros concurseiros em tempo real e conquiste premiações exclusivas."
                badge="COMPETITIVE"
            />

            {/* Pending Challenges Notification */}
            {pendingDuels.length > 0 && (
                <div
                    className="mb-8 p-6 rounded-[32px] bg-primary text-primary-foreground flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
                            <Swords className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-black text-lg">Novo Desafio Recebido!</h4>
                            <p className="text-sm opacity-80 font-medium">{pendingDuels[0].challenger} te desafiou em {pendingDuels[0].subject}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" className="rounded-xl font-black px-8">Aceitar</Button>
                        <Button variant="ghost" onClick={() => setPendingDuels([])} className="text-white hover:bg-white/10 rounded-xl font-bold">Recusar</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs */}
                    <div className="flex p-1 bg-muted rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('online')}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'online' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground'}`}
                        >
                            Jogadores Online
                        </button>
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'ranking' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground'}`}
                        >
                            Ranking de Duelos
                        </button>
                    </div>

                    {activeTab === 'online' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {onlineUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="p-6 rounded-[32px] bg-card border flex items-center justify-between group hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{user.name}</h4>
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <Zap className="w-3 h-3 text-warning fill-current" />
                                                Nível {user.level} • {user.xp} XP
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="rounded-xl font-black gap-2">
                                        <Swords className="w-4 h-4" />
                                        Desafiar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card border rounded-[40px] overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-8 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Posição</th>
                                        <th className="px-8 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Jogador</th>
                                        <th className="px-8 py-4 text-center text-xs font-black text-muted-foreground uppercase tracking-widest">Vitórias</th>
                                        <th className="px-8 py-4 text-center text-xs font-black text-muted-foreground uppercase tracking-widest">Aproveitamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {ranking.map((row) => (
                                        <tr key={row.pos} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-8 py-6 font-black text-xl text-muted-foreground">#{row.pos}</td>
                                            <td className="px-8 py-6 font-bold">{row.name}</td>
                                            <td className="px-8 py-6 text-center font-black">{row.wins}</td>
                                            <td className="px-8 py-6 text-center font-bold text-success">{row.ratio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <Trophy className="w-12 h-12 mb-4 opacity-50" />
                        <h3 className="text-xl font-black mb-2">Prêmios da Semana</h3>
                        <p className="text-sm opacity-80 mb-6 font-medium">Os 3 primeiros do ranking de duelos ganham cupons de 50% de desconto!</p>
                        <div className="text-2xl font-black">R$ 500,00</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Em prêmios acumulados</div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-card border space-y-4">
                        <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Configurar Duelo</h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-2xl bg-muted/50 border space-y-1">
                                <div className="text-[10px] font-black uppercase text-muted-foreground">Modo</div>
                                <div className="font-bold flex items-center justify-between">
                                    Questionário
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/50 border space-y-1">
                                <div className="text-[10px] font-black uppercase text-muted-foreground">Assunto</div>
                                <div className="font-bold flex items-center justify-between">
                                    Direito Administrativo
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-2xl font-black">
                            Regras do Duelo
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
