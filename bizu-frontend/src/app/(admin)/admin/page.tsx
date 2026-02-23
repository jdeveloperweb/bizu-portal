"use client";

import PageHeader from "@/components/PageHeader";
import {
    Users,
    CreditCard,
    TrendingUp,
    AlertCircle,
    Activity,
    ArrowUpRight,
    UserCheck,
    UserX
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
    const stats = [
        { label: "Total de Alunos", value: "1,284", icon: Users, color: "text-blue-500", trend: "+12%" },
        { label: "Ativos Hoje (DAU)", value: "342", icon: Activity, color: "text-orange-500", trend: "+24%" },
        { label: "Ativos no Mês (MAU)", value: "956", icon: UserCheck, color: "text-success", trend: "+8%" },
        { label: "Faturamento Mensal", value: "R$ 42.800", icon: CreditCard, color: "text-purple-500", trend: "+15%" },
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <PageHeader
                title="Painel Administrativo"
                description="Visão geral do ecossistema Bizu!. Monitore métricas, usuários e planos em tempo real."
                badge="ADMIN"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="p-8 rounded-[40px] bg-card border group hover:border-primary/50 transition-all"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-muted flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-xs font-black px-2 py-1 bg-success/10 text-success rounded-lg">
                                {stat.trend}
                            </div>
                        </div>
                        <div className="text-3xl font-black mb-1">{stat.value}</div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[48px] bg-card border space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <Activity className="w-6 h-6 text-primary" />
                                Atividade Recente
                            </h3>
                            <Button variant="ghost" className="text-xs font-black uppercase tracking-widest">Ver Todos</Button>
                        </div>

                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted" />
                                        <div>
                                            <div className="font-bold">Novo Assinante: Maria Silva</div>
                                            <div className="text-xs text-muted-foreground font-medium italic">Plano Diamante (Anual) - Há 2 horas</div>
                                        </div>
                                    </div>
                                    <div className="font-black text-success">+ R$ 497,00</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-10 rounded-[48px] bg-primary text-primary-foreground shadow-2xl shadow-primary/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                        <h3 className="text-xl font-black mb-2">Meta de Vendas</h3>
                        <p className="text-sm opacity-80 mb-6 font-medium">Você atingiu 82% da meta total deste mês. Faltam R$ 7.200 para o bônus.</p>
                        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-[82%] h-full bg-white rounded-full shadow-lg" />
                        </div>
                    </div>

                    <div className="p-10 rounded-[48px] bg-warning/5 border border-warning/20 space-y-4">
                        <div className="flex items-center gap-3 text-warning">
                            <AlertCircle className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Alertas de Sistema</h4>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            Existem 3 transações pendentes de confirmação no Stripe. Verifique os webhooks para garantir a ativação dos planos.
                        </p>
                        <Button variant="outline" className="w-full h-12 rounded-2xl border-warning/20 text-warning hover:bg-warning/10 font-black">
                            Resolver Agora
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
