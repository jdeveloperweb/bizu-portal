import PageHeader from "@/components/PageHeader";
import {
    Trophy,
    Flame,
    Target,
    PlayCircle,
    Clock,
    CheckCircle2,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <PageHeader
                    title="Olá, Jaime!"
                    description="Bem-vindo de volta. O que vamos estudar hoje?"
                    badge="DASHBOARD"
                />

                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-accent/10 border border-accent/20 flex items-center gap-3">
                        <Flame className="w-8 h-8 text-accent fill-accent" />
                        <div>
                            <div className="text-2xl font-black text-accent leading-none">07</div>
                            <div className="text-[10px] font-bold text-accent/70 uppercase">Dias Seguidos</div>
                        </div>
                    </div>
                    <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-primary" />
                        <div>
                            <div className="text-2xl font-black text-primary leading-none">1.2k</div>
                            <div className="text-[10px] font-bold text-primary/70 uppercase">XP Acumulado</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Current Course & Progress */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="group relative p-8 rounded-[40px] bg-gradient-to-br from-primary to-primary-dark text-primary-foreground overflow-hidden shadow-2xl shadow-primary/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                        <div className="relative">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-80 mb-4">
                                <PlayCircle className="w-4 h-4" />
                                Continuar Assistindo
                            </div>
                            <h2 className="text-3xl font-black mb-2">Magistratura Federal</h2>
                            <p className="text-primary-foreground/80 mb-8 max-w-md">Módulo 4: Competência da Justiça Federal no Processo Penal.</p>

                            <div className="flex items-end justify-between gap-4 mb-2">
                                <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-white rounded-full" />
                                </div>
                                <div className="font-bold text-lg">65%</div>
                            </div>
                            <div className="text-xs font-bold opacity-70 mb-8">24 de 40 aulas concluídas</div>

                            <Link href="/cursos/magistratura-federal">
                                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl px-12 h-14 font-black">
                                    Retomar Estudos
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl bg-card border hover:border-primary transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Simulado Semanal</h3>
                            <p className="text-sm text-muted-foreground mb-6">Teste seus conhecimentos com questões inéditas baseadas no seu desempenho.</p>
                            <Button variant="ghost" className="p-0 text-primary hover:text-primary-dark font-bold flex items-center gap-2">
                                Começar agora <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-8 rounded-3xl bg-card border hover:border-primary transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-success" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Revisão Rápida</h3>
                            <p className="text-sm text-muted-foreground mb-6">10 questões selecionadas dos assuntos que você mais precisa revisar.</p>
                            <Button variant="ghost" className="p-0 text-primary hover:text-primary-dark font-bold flex items-center gap-2">
                                Iniciar revisão <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Performance Metrics */}
                <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-card border">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Desempenho Geral
                        </h3>

                        <div className="space-y-6">
                            {[
                                { label: "Direito Penal", color: "bg-primary", value: 85 },
                                { label: "Direito Civil", color: "bg-accent", value: 72 },
                                { label: "Direito Const.", color: "bg-success", value: 92 },
                                { label: "Dir. Administrativo", color: "bg-danger", value: 58 },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span>{item.label}</span>
                                        <span>{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full mt-8 rounded-2xl font-bold">
                            Ver Relatório Detalhado
                        </Button>
                    </div>

                    <div className="p-8 rounded-3xl bg-card border">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            Conquistas Recentes
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-help" title={`Conquista ${i}`}>
                                    🏆
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
